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
import { CreateEventDto } from '@/common/dto/event/CreateEvent.dto';
import { EventTagsRepository } from '@/modules/event/infra/repository/EventTags.repository';
import { mergeTagsWithCategories } from '@/common/utils/category-to-tags.util';
import { CategoryType } from '@/common/constants/CategoryType.constant';
import { ILocationBookingManagementService } from '@/modules/location-booking/app/ILocationBookingManagement.service';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';

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
            const filesToConfirm = dto.eventValidationDocuments.flatMap(
              (i) => i.documentImageUrls,
            );
            await this.fileStorageService.confirmUpload(filesToConfirm, em);
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
          .then(async (savedEvent) => {
            if (dto.eventLocation) {
              const locationBooking =
                await this.locationBookingService.createBooking_ForBusinessLocation(
                  {
                    accountId: dto.accountId,
                    dates: dto.eventLocation.dates,
                    locationId: dto.eventLocation.locationId,
                  },
                );
              savedEvent.locationBookings = [
                this.mapTo_safe(LocationBookingEntity, locationBooking),
              ];
            }
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

      // Confirm uploads for image URLs
      await this.fileStorageService.confirmUpload(
        [dto.avatarUrl, dto.coverUrl],
        em,
      );

      const updatedEvent = this.mapTo_safe(EventEntity, dto);
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
}
