import { CoreService } from '@/common/core/Core.service';
import { UpdateEventDto } from '@/common/dto/event/UpdateEvent.dto';
import { IEventManagementService } from '@/modules/event/app/IEventManagement.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { In, UpdateResult } from 'typeorm';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { PublishEventDto } from '@/common/dto/event/PublishEvent.dto';
import { EventStatus } from '@/common/constants/EventStatus.constant';
import { FinishEventDto } from '@/common/dto/event/FinishEvent.dto';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { CancelEventBookingDto } from '@/common/dto/event/CancelEventBooking.dto';
import { CreateEventDto } from '@/common/dto/event/CreateEvent.dto';
import { EventTagsRepository } from '@/modules/event/infra/repository/EventTags.repository';
import { HandleBookingForceCancelledDto } from '@/common/dto/event/HandleBookingForceCancelled.dto';
import { CategoryType } from '@/common/constants/CategoryType.constant';
import { mergeTagsWithCategories } from '@/common/utils/category-to-tags.util';
import { ILocationBookingManagementService } from '@/modules/location-booking/app/ILocationBookingManagement.service';
import { InitiateEventBookingPaymentDto } from '@/common/dto/event/InitiateBookingPayment.dto';
import { AddLocationBookingDto } from '@/common/dto/event/AddLocationBooking.dto';
import { CancelEventDto } from '@/common/dto/event/CancelEvent.dto';
import { ITicketOrderManagementService } from '@/modules/event/app/ITicketOrderManagement.service';
import { LocationBookingRepository } from '@/modules/location-booking/infra/repository/LocationBooking.repository';
import { LocationBookingObject } from '@/common/constants/LocationBookingObject.constant';
import { IEventPayoutService } from '@/modules/event/app/IEventPayout.service';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';
import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';
import { HandleBookingRejectedDto } from '@/common/dto/location-booking/HandleBookingRejected.dto';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { HandleForceCancelEventDto } from '@/common/dto/event/HandleForceCancelEvent.dto';
import { ISystemConfigService } from '@/modules/utility/app/ISystemConfig.service';
import { SystemConfigKey } from '@/common/constants/SystemConfigKey.constant';
import e from 'express';

@Injectable()
export class EventManagementService
  extends CoreService
  implements IEventManagementService
{
  constructor(
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
    @Inject(forwardRef(() => ILocationBookingManagementService))
    private readonly locationBookingService: ILocationBookingManagementService,
    @Inject(ITicketOrderManagementService)
    private readonly ticketOrderManagementService: ITicketOrderManagementService,
    @Inject(IEventPayoutService)
    private readonly eventPayoutService: IEventPayoutService,
    @Inject(ISystemConfigService)
    private readonly systemConfigService: ISystemConfigService,
  ) {
    super();
  }

  handleBookingRejected(
    dto: HandleBookingRejectedDto,
  ): Promise<EventResponseDto[]> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const eventRepository = EventRepository(em);
      const events = await eventRepository.find({
        where: {
          id: In(dto.eventId),
        },
      });

      if (events.length !== dto.eventId.length) {
        throw new BadRequestException('One or more events not found.');
      }

      for (const event of events) {
        event.locationId = null;
      }

      return eventRepository.save(events);
    }).then((res) => this.mapToArray(EventResponseDto, res));
  }

  createEvent(dto: CreateEventDto): Promise<EventResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepo = EventRepository(em);
      const eventTagRepo = EventTagsRepository(em);
      const accountRepo = AccountRepositoryProvider(em);

      const account = await accountRepo.findOneOrFail({
        where: {
          id: dto.accountId,
        },
        relations: {
          creatorProfile: true,
        },
      });

      if (
        account.creatorProfile?.eventCreationSuspendedUntil &&
        account.creatorProfile.eventCreationSuspendedUntil > new Date()
      ) {
        throw new BadRequestException(
          'Event creation is suspended until ' +
            account.creatorProfile.eventCreationSuspendedUntil.toLocaleDateString(
              'vi-VN',
            ) +
            '. Please try again later.',
        );
      }

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
      const systemCutPercentage =
        await this.systemConfigService.getSystemConfigValue(
          SystemConfigKey.EVENT_SYSTEM_PAYOUT_PERCENTAGE,
          em,
        );
      event.systemCutPercentage = systemCutPercentage.value;

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

      // published can only update description and images, exclude other fields
      if (event.status === EventStatus.PUBLISHED) {
        dto.displayName = undefined;
        dto.startDate = undefined;
        dto.endDate = undefined;
        dto.eventValidationDocuments = undefined;
        dto.expectedNumberOfParticipants = undefined;
      }

      // Confirm uploads for image URLs and validation documents
      await this.fileStorageService.confirmUpload(
        [
          dto.avatarUrl,
          dto.coverUrl,
          ...(dto.eventValidationDocuments?.flatMap(
            (i) => i.documentImageUrls,
          ) ?? []),
        ],
        em,
      );

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
      const locationBookingRepo = LocationBookingRepository(em);

      const event = await eventRepository.findOneOrFail({
        where: {
          id: dto.eventId,
          createdById: dto.accountId,
        },
        relations: {
          tickets: true,
        },
      });

      if (!event.canBePublished()) {
        throw new BadRequestException(
          'Event is missing required information to be published. Requires: Location, Display Name, Start Date, End Date, Tickets.',
        );
      }

      const locationBookings = await locationBookingRepo.find({
        where: {
          bookingObject: LocationBookingObject.FOR_EVENT,
          targetId: dto.eventId,
          status: LocationBookingStatus.APPROVED,
        },
      });

      const approvedLocationBookings = locationBookings.map(
        (booking) => booking.locationId,
      );

      if (
        approvedLocationBookings.length === 0 ||
        (event.locationId &&
          !approvedLocationBookings.includes(event.locationId))
      ) {
        throw new BadRequestException(
          'Event cannot be published. Location booking is not approved.',
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

      // save
      event.status = EventStatus.FINISHED;
      await eventRepository.save(event);

      const result = await this.eventPayoutService.scheduleEventPayout({
        eventId: event.id,
        entityManager: em,
      });

      return this.mapTo(EventResponseDto, result);
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
        eventId: dto.eventId,
        refundReason: 'Event was cancelled by the organizer.',
        entityManager: em,
        refundPercentage: 1,
        shouldCancelTickets: true,
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

      // validate location booking times to have to contain the event booking times
      if (
        !LocationBookingEntity.validateBookingTimes(
          dto.dates.map((i) => ({
            startDateTime: i.startDateTime,
            endDateTime: i.endDateTime,
          })),
          event.startDate,
          event.endDate,
        )
      ) {
        throw new BadRequestException(
          'Location booking times must contain the event booking times.',
        );
      }

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

      // add location to event
      event.locationId = locationBooking.locationId;

      return eventRepo.save(event).then((res) =>
        this.mapTo(EventResponseDto, {
          ...res,
          locationBookings: [locationBooking],
        }),
      );
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
              'You cannot cancel this event booking. You can only cancel bookings for events that are DRAFT.',
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

  handleBookingForceCancelled(
    dto: HandleBookingForceCancelledDto,
  ): Promise<EventResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepository = EventRepository(em);
      const event = await eventRepository.findOneOrFail({
        where: {
          id: dto.eventId,
        },
      });

      event.locationId = null;
      const savedEvent = await eventRepository.save(event);

      if (event.status === EventStatus.PUBLISHED) {
        return await this.handleForceCancelEvent({
          eventId: dto.eventId,
          entityManager: em,
        });
      }
      return savedEvent;
    }).then((res) => this.mapTo(EventResponseDto, res));
  }

  handleForceCancelEvent(
    dto: HandleForceCancelEventDto,
  ): Promise<EventResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const eventRepo = EventRepository(em);

      const event = await eventRepo.findOneOrFail({
        where: {
          id: dto.eventId,
        },
      });

      // can only cancel events that haven't been paid out yet
      if (event.hasPaidOut) {
        throw new BadRequestException(
          'Event has already been paid out. Cannot be cancelled.',
        );
      }

      /* 
      1. Refund all successful ticket orders 100%
      2. Mark the event as cancelled
      3. DO NOTHING with the location booking
      4. Notify all
      */

      // 1
      await this.ticketOrderManagementService.refundAllSuccessfulOrders({
        eventId: dto.eventId,
        refundPercentage: 1,
        shouldCancelTickets: true,
        entityManager: em,
      });

      // 2
      event.status = EventStatus.CANCELLED;

      // 3
      // I'm doing nothing here...

      return eventRepo.save(event);
    }).then((res) => this.mapTo(EventResponseDto, res));
  }
}
