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
import { CreateEventFromRequestDto } from '@/common/dto/event/CreateEventFromRequest.dto';
import { EventRequestRepository } from '@/modules/event/infra/repository/EventRequest.repository';
import { EventTagsRepository } from '@/modules/event/infra/repository/EventTags.repository';

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
    private readonly configService: ConfigService<Environment>,
  ) {
    super();
    this.MILLIS_TO_EVENT_PAYOUT = this.configService.getOrThrow<number>(
      'MILLIS_TO_EVENT_PAYOUT',
    );
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

  createEventFromRequest(dto: CreateEventFromRequestDto): Promise<void> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const eventRepository = EventRepository(em);
      const eventRequestRepository = EventRequestRepository(em);
      const eventTagsRepository = EventTagsRepository(em);

      const eventRequest = await eventRequestRepository.findOneOrFail({
        where: {
          id: dto.eventRequestId,
        },
        relations: {
          referencedLocationBooking: true,
          tags: {
            tagCategory: true,
          },
        },
      });

      const event = new EventEntity();
      event.displayName = eventRequest.eventName;
      event.description = eventRequest.eventDescription;
      event.locationId = eventRequest.referencedLocationBooking.locationId;
      event.referencedEventRequestId = dto.eventRequestId;
      event.createdById = eventRequest.createdById;
      event.social = eventRequest.social;
      event.status = EventStatus.DRAFT;

      return (
        eventRepository
          .save(event)
          // convert tag categories to tag IDs and save tags
          .then(async (savedEvent) => {
            await eventTagsRepository.persistEntities({
              eventId: savedEvent.id,
              tagCategoryIds: eventRequest.tags.map((i) => i.tagCategoryId),
            });
          })
      );
    });
  }
}
