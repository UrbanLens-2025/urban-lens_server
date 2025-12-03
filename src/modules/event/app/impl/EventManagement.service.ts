import { CoreService } from '@/common/core/Core.service';
import { UpdateEventDto } from '@/common/dto/event/UpdateEvent.dto';
import { IEventManagementService } from '@/modules/event/app/IEventManagement.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { PublishEventDto } from '@/common/dto/event/PublishEvent.dto';
import { EventStatus } from '@/common/constants/EventStatus.constant';
import { FinishEventDto } from '@/common/dto/event/FinishEvent.dto';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { IScheduledJobService } from '@/modules/scheduled-jobs/app/IScheduledJob.service';
import dayjs from 'dayjs';
import { ScheduledJobType } from '@/common/constants/ScheduledJobType.constant';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';
import { CancelEventBookingDto } from '@/common/dto/event/CancelEventBooking.dto';
import { CreateEventDto } from '@/common/dto/event/CreateEvent.dto';
import { EventTagsRepository } from '@/modules/event/infra/repository/EventTags.repository';
import { CategoryType } from '@/common/constants/CategoryType.constant';
import { mergeTagsWithCategories } from '@/common/utils/category-to-tags.util';
import { ILocationBookingManagementService } from '@/modules/location-booking/app/ILocationBookingManagement.service';
import { InitiateEventBookingPaymentDto } from '@/common/dto/event/InitiateBookingPayment.dto';
import { AddLocationBookingDto } from '@/common/dto/event/AddLocationBooking.dto';
import { CancelEventDto } from '@/common/dto/event/CancelEvent.dto';
import { ITicketOrderManagementService } from '@/modules/event/app/ITicketOrderManagement.service';
import { LocationBookingRepository } from '@/modules/location-booking/infra/repository/LocationBooking.repository';
import { LocationBookingObject } from '@/common/constants/LocationBookingObject.constant';

@Injectable()
export class EventManagementService
  extends CoreService
  implements IEventManagementService
{
  private readonly MILLIS_TO_EVENT_PAYOUT: number;

  constructor(
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
    @Inject(IScheduledJobService)
    private readonly scheduledJobService: IScheduledJobService,
    @Inject(ILocationBookingManagementService)
    private readonly locationBookingService: ILocationBookingManagementService,
    @Inject(ITicketOrderManagementService)
    private readonly ticketOrderManagementService: ITicketOrderManagementService,
    private readonly configService: ConfigService<Environment>,
  ) {
    super();
    this.MILLIS_TO_EVENT_PAYOUT = this.configService.getOrThrow<number>(
      'MILLIS_TO_EVENT_PAYOUT',
    );
  }

  createEvent(dto: CreateEventDto): Promise<EventResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepo = EventRepository(em);
      const eventTagRepo = EventTagsRepository(em);

      const finalTagIds = await mergeTagsWithCategories(
        [], // No manual tags
        dto.categoryIds,
        CategoryType.EVENT,
        em,
      );

      // event must have at least one tag
      if (finalTagIds.length === 0) {
        throw new BadRequestException(
          'Selected categories do not contain any valid tags',
        );
      }

      const event = this.mapTo_safe(EventEntity, dto);
      event.createdById = dto.accountId;
      event.status = EventStatus.DRAFT;

      return (
        eventRepo
          .save(event)
          // confirm uploads
          .then(async (newEvent) => {
            const filesToConfirm = dto.eventValidationDocuments?.flatMap(
              (i) => i.documentImageUrls,
            );
            await this.fileStorageService.confirmUpload(
              filesToConfirm ?? [],
              em,
            );
            return newEvent;
          })
          // save tags
          .then(async (savedEvent) => {
            savedEvent.tags = await eventTagRepo.persistEntities({
              eventId: savedEvent.id,
              tagIds: finalTagIds,
            });
            return savedEvent;
          })
          // map to response
          .then((res) => this.mapTo(EventResponseDto, res))
      );
    });
  }

  updateMyEvent(dto: UpdateEventDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepository = EventRepository(em);

      const event = await eventRepository.findOneByOrFail({
        id: dto.eventId,
        createdById: dto.accountId,
      });

      if (!event.canBeUpdated()) {
        throw new BadRequestException(
          'Event cannot be updated. You can only update events that are DRAFT.',
        );
      }

      // Confirm uploads for image URLs and validation documents
      const filesToConfirm = [
        dto.avatarUrl,
        dto.coverUrl,
        ...(dto.eventValidationDocuments?.flatMap((i) => i.documentImageUrls) ??
          []),
      ];
      await this.fileStorageService.confirmUpload(filesToConfirm, em);

      const updatedEvent = this.mapTo_safe(EventEntity, dto);
      if (dto.eventValidationDocuments) {
        updatedEvent.eventValidationDocuments = dto.eventValidationDocuments;
      }

      return eventRepository.update({ id: dto.eventId }, updatedEvent);
    });
  }

  publishEvent(dto: PublishEventDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepository = EventRepository(em);

      const event = await eventRepository.findOneByOrFail({
        id: dto.eventId,
        createdById: dto.accountId,
      });

      if (!event.canBePublished()) {
        throw new BadRequestException(
          'Event is missing required information to be published. Requires: Location, Display Name, Start Date, End Date.',
        );
      }

      return eventRepository.update(
        { id: dto.eventId },
        { status: EventStatus.PUBLISHED },
      );
    });
  }

  finishEvent(dto: FinishEventDto): Promise<EventResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepository = EventRepository(em);

      const event = await eventRepository.findOneOrFail({
        where: {
          id: dto.eventId,
          createdById: dto.accountId,
        },
        relations: {
          ticketOrders: true,
        },
      });

      if (!event.canBeFinished()) {
        throw new BadRequestException(
          'Event cannot be finished. You can only finish events that are PUBLISHED and have started and ended.',
        );
      }

      // TODO: Add more conditions here

      const totalRevenueFromTickets = event.ticketOrders.reduce(
        (sum, order) => {
          return sum + Number(order.totalPaymentAmount);
        },
        0,
      );

      if (totalRevenueFromTickets > 0) {
        // Trigger payout process to event owner after 1 week cooldown
        const now = dayjs();
        const executeAt = now
          .add(this.MILLIS_TO_EVENT_PAYOUT, 'milliseconds')
          .toDate();
        const job =
          await this.scheduledJobService.createLongRunningScheduledJob({
            entityManager: em,
            executeAt,
            jobType: ScheduledJobType.EVENT_PAYOUT,
            payload: {
              eventId: event.id,
            },
            associatedId: event.id,
          });
        event.scheduledJobId = job.id;
      } else {
        event.hasPaidOut = true;
        event.scheduledJobId = null;
        event.paidOutAt = new Date();
      }

      // save
      event.status = EventStatus.FINISHED;

      return await eventRepository
        .save(event)
        .then((res) => this.mapTo(EventResponseDto, res));
    });
  }

  cancelEvent(dto: CancelEventDto): Promise<EventResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepo = EventRepository(em);
      const locationBookingRepo = LocationBookingRepository(em);
      const event = await eventRepo
        .findOneOrFail({
          where: {
            id: dto.eventId,
            createdById: dto.accountId,
          },
        })
        .then((res) => {
          if (!res.canBeCancelled()) {
            throw new BadRequestException('Event cannot be cancelled.');
          }
          return res;
        });

      event.status = EventStatus.CANCELLED;
      const locationBookings = await locationBookingRepo.find({
        where: {
          bookingObject: LocationBookingObject.FOR_EVENT,
          targetId: dto.eventId,
        },
      });

      // refund tickets
      await this.ticketOrderManagementService.refundAllSuccessfulOrders({
        accountId: dto.accountId,
        eventId: dto.eventId,
        refundReason: 'Event was cancelled by the organizer.',
        entityManager: em,
      });

      // cancel booking
      for (const locationBooking of locationBookings) {
        if (locationBooking.canBeCancelled()) {
          await this.locationBookingService.cancelBooking({
            accountId: dto.accountId,
            locationBookingId: locationBooking.id,
            cancellationReason: 'Event was cancelled by the organizer.',
            entityManager: em,
          });
        }
      }

      return eventRepo.save(event);
    }).then((res) => this.mapTo(EventResponseDto, res));
  }

  addLocationBooking(dto: AddLocationBookingDto): Promise<EventResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepo = EventRepository(em);
      const locationBookingRepo = LocationBookingRepository(em);

      const event = await eventRepo
        .findOneOrFail({
          where: {
            id: dto.eventId,
            createdById: dto.accountId,
          },
        })
        .then((res) => {
          if (!res.canSafelyModifyBooking()) {
            throw new BadRequestException(
              'You can only modify bookings for events that are DRAFT.',
            );
          }

          return res;
        });

      const locationBookings = await locationBookingRepo.find({
        where: {
          bookingObject: LocationBookingObject.FOR_EVENT,
          targetId: dto.eventId,
        },
      });

      // validate dates (each entry must be one day)
      // ? removed because of time zone issues
      // for (const date of dto.dates) {
      //   const start = dayjs(date.startDateTime);
      //   const end = dayjs(date.endDateTime);
      //   if (!start.isSame(end, 'day')) {
      //     throw new BadRequestException(
      //       'Each date range must be one day. If you need to book for multiple days, please add multiple dates.',
      //     );
      //   }
      // }

      // validate selected dates (check for conflicts with existing bookings)

      // check if location booking already exists
      const existingLocationBooking = locationBookings.find((booking) => {
        return booking.locationId === dto.locationId && booking.isActive();
      });
      if (existingLocationBooking) {
        throw new BadRequestException(
          'You have already added a booking for this location.',
        );
      }

      const locationBooking =
        await this.locationBookingService.createBooking_ForBusinessLocation({
          targetId: dto.eventId,
          accountId: dto.accountId,
          dates: dto.dates,
          locationId: dto.locationId,
        });

      return this.mapTo(EventResponseDto, {
        ...event,
        locationBookings: [locationBooking],
      });
    });
  }

  initiateBookingPayment(
    dto: InitiateEventBookingPaymentDto,
  ): Promise<EventResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepo = EventRepository(em);
      const locationBookingRepo = LocationBookingRepository(em);
      const event = await eventRepo
        .findOneOrFail({
          where: {
            id: dto.eventId,
          },
        })
        // check if event can still be updated
        .then((res) => {
          if (!res.canBeUpdated()) {
            throw new BadRequestException(
              'Event is not eligible for booking confirmation.',
            );
          }
          return res;
        });

      // get the location booking in question
      const locationBooking = await locationBookingRepo.findOneOrFail({
        where: {
          id: dto.locationBookingId,
          bookingObject: LocationBookingObject.FOR_EVENT,
          targetId: dto.eventId,
        },
      });

      // initiate payment in the location booking module
      const locationBookingResponse =
        await this.locationBookingService.payForBooking({
          ...dto,
          locationBookingId: locationBooking.id,
          entityManager: em,
        });

      // after booking is paid, update the event with the confirmed location
      event.locationId = locationBookingResponse.locationId;
      await eventRepo.update(
        { id: event.id },
        { locationId: event.locationId },
      );

      return this.mapTo(EventResponseDto, {
        ...event,
        locationId: event.locationId,
        locationBookings: [locationBookingResponse],
      });
    });
  }

  cancelEventBooking(dto: CancelEventBookingDto): Promise<EventResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepository = EventRepository(em);
      const event = await eventRepository
        .findOneOrFail({
          where: {
            id: dto.eventId,
            createdById: dto.accountId,
          },
        })
        .then((res) => {
          if (!res.canSafelyModifyBooking()) {
            throw new BadRequestException(
              'You cannot cancel this event booking.',
            );
          }
          return res;
        });
      const locationBooking = await this.locationBookingService.cancelBooking({
        accountId: dto.accountId,
        locationBookingId: dto.locationBookingId,
        cancellationReason: dto.cancellationReason,
        entityManager: em,
      });

      event.locationId = null; // remove location from event

      return await eventRepository
        .save(event)
        .then((res) => this.mapTo(EventResponseDto, res));
    });
  }
}
