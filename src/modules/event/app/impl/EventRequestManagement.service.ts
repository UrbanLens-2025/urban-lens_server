import { CoreService } from '@/common/core/Core.service';
import { CreateEventRequestWithBusinessLocationDto } from '@/common/dto/event/CreateEventRequestWithBusinessLocation.dto';
import { IEventRequestManagementService } from '@/modules/event/app/IEventRequestManagement.service';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { EventRequestRepository } from '@/modules/event/infra/repository/EventRequest.repository';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';
import { EventRequestEntity } from '@/modules/event/domain/EventRequest.entity';
import { EventRequestStatus } from '@/common/constants/EventRequestStatus.constant';
import { EventRequestResponseDto } from '@/common/dto/event/res/EventRequest.response.dto';
import { TagRepositoryProvider } from '@/modules/utility/infra/repository/Tag.repository';
import { EventRequestTagsRepository } from '@/modules/event/infra/repository/EventRequestTags.repository';
import { ILocationBookingManagementService } from '@/modules/location-booking/app/ILocationBookingManagement.service';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { StartBookingPaymentDto } from '@/common/dto/location-booking/StartBookingPayment.dto';
import { EntityManager } from 'typeorm';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { EventStatus } from '@/common/constants/EventStatus.constant';
import { EventTagsRepository } from '@/modules/event/infra/repository/EventTags.repository';
import { mergeTagsWithCategories } from '@/common/utils/category-to-tags.util';
import { CategoryType } from '@/common/constants/CategoryType.constant';

@Injectable()
export class EventRequestManagementService
  extends CoreService
  implements IEventRequestManagementService
{
  constructor(
    private readonly configService: ConfigService<Environment>,
    @Inject(ILocationBookingManagementService)
    private readonly locationBookingService: ILocationBookingManagementService,
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {
    super();
  }

  createEventRequest_WithBusinessLocation(
    dto: CreateEventRequestWithBusinessLocationDto,
  ): Promise<EventRequestResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRequestRepository = EventRequestRepository(em);
      const tagRepository = TagRepositoryProvider(em);
      const eventRequestTagRepository = EventRequestTagsRepository(em);

      // Convert categories to tags
      const finalTagIds = await mergeTagsWithCategories(
        [], // No manual tags
        dto.categoryIds,
        CategoryType.EVENT,
        this.dataSource,
      );

      if (finalTagIds.length === 0) {
        throw new BadRequestException(
          'Selected categories do not contain any valid tags',
        );
      }

      // validate tags
      const tags = await tagRepository.countSelectableTagsById(finalTagIds);
      if (tags !== finalTagIds.length) {
        throw new BadRequestException(
          'One or more tags from categories are invalid. Please check tag visibility.',
        );
      }

      // create location booking with dates
      const locationBooking =
        await this.locationBookingService.createBooking_ForBusinessLocation({
          accountId: dto.accountId,
          locationId: dto.locationId,
          dates: dto.dates,
        });

      const eventRequest = this.mapTo_safe(EventRequestEntity, dto);
      eventRequest.createdById = dto.accountId;
      eventRequest.status = EventRequestStatus.PENDING;
      eventRequest.referencedLocationBookingId = locationBooking.id;

      return (
        eventRequestRepository
          .save(eventRequest)
          // confirm uploads
          .then(async (savedEventRequest) => {
            const filesToConfirm = dto.eventValidationDocuments.flatMap(
              (i) => i.documentImageUrls,
            );
            await this.fileStorageService.confirmUpload(filesToConfirm, em);
            return savedEventRequest;
          })
          // save tags
          .then(async (savedEventRequest) => {
            savedEventRequest.tags =
              await eventRequestTagRepository.persistEntities({
                eventRequestId: savedEventRequest.id,
                tagIds: finalTagIds,
              });
            return savedEventRequest;
          })
          // map to response
          .then((res) => this.mapTo(EventRequestResponseDto, res))
      );
    });
  }

  initiatePayment(
    dto: StartBookingPaymentDto,
  ): Promise<EventRequestResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRequestRepository = EventRequestRepository(em);

      const eventRequest = await eventRequestRepository
        .findOneOrFail({
          where: {
            id: dto.eventRequestId,
          },
        })
        // check can confirm
        .then((res) => {
          if (!res.canConfirmBooking()) {
            throw new BadRequestException(
              'Event request is not eligible for booking confirmation.',
            );
          }
          return res;
        });

      return await this.locationBookingService
        .payForBooking({
          ...dto,
          locationBookingId: eventRequest.referencedLocationBookingId,
          entityManager: em,
        })
        // update event request status
        .then(async (_) => {
          await eventRequestRepository.update(
            {
              id: eventRequest.id,
            },
            eventRequest.confirmBooking(),
          );

          return _;
        })
        // transfer event request details to event
        .then(async (_) => {
          await this.createEventFromRequest(eventRequest.id, em);
          return _;
        })
        // map to dto
        .then((locationBookingResponseDto) => ({
          ...this.mapTo(EventRequestResponseDto, eventRequest),
          locationBooking: locationBookingResponseDto,
        }));
    });
  }

  private async createEventFromRequest(
    eventRequestId: string,
    entityManager: EntityManager,
  ) {
    return this.ensureTransaction(entityManager, async (em) => {
      const eventRepository = EventRepository(em);
      const eventRequestRepository = EventRequestRepository(em);
      const eventTagsRepository = EventTagsRepository(em);

      const eventRequest = await eventRequestRepository.findOneOrFail({
        where: {
          id: eventRequestId,
        },
        relations: {
          referencedLocationBooking: true,
          tags: true,
        },
      });

      const event = new EventEntity();
      event.displayName = eventRequest.eventName;
      event.description = eventRequest.eventDescription;
      event.locationId = eventRequest.referencedLocationBooking.locationId;
      event.createdById = eventRequest.createdById;
      event.social = eventRequest.social;
      event.status = EventStatus.DRAFT;

      return (
        eventRepository
          .save(event)
          // save tags
          .then(async (event) => {
            await eventTagsRepository.persistEntities({
              eventId: event.id,
              tagIds: eventRequest.tags.map((i) => i.tagId),
            });
          })
      );
    });
  }
}
