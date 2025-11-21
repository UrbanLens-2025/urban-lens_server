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
import { EventRequestTagsRepository } from '@/modules/event/infra/repository/EventRequestTags.repository';
import { ILocationBookingManagementService } from '@/modules/location-booking/app/ILocationBookingManagement.service';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { StartBookingPaymentDto } from '@/common/dto/location-booking/StartBookingPayment.dto';
import { In } from 'typeorm';
import { TagCategoryRepositoryProvider } from '@/modules/utility/infra/repository/TagCategory.repository';
import { IEventManagementService } from '@/modules/event/app/IEventManagement.service';

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
    @Inject(IEventManagementService)
    private readonly eventManagementService: IEventManagementService,
  ) {
    super();
  }

  createEventRequest_WithBusinessLocation(
    dto: CreateEventRequestWithBusinessLocationDto,
  ): Promise<EventRequestResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRequestRepository = EventRequestRepository(em);
      const eventRequestTagRepository = EventRequestTagsRepository(em);
      const tagCategoryRepository = TagCategoryRepositoryProvider(em);

      // check tag categories exist
      const tagCategories = await tagCategoryRepository
        .find({
          where: {
            id: In(dto.categoryIds),
          },
        })
        .then((res) => {
          if (res.length !== dto.categoryIds.length) {
            throw new BadRequestException(
              'One or more tag category IDs are not available',
            );
          }
          return res;
        });

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
                tagCategoryIds: tagCategories.map((i) => i.id),
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
          await this.eventManagementService.createEventFromRequest({
            eventRequestId: eventRequest.id,
            entityManager: em,
          });
          return _;
        })
        // map to dto
        .then((locationBookingResponseDto) => ({
          ...this.mapTo(EventRequestResponseDto, eventRequest),
          locationBooking: locationBookingResponseDto,
        }));
    });
  }
}
