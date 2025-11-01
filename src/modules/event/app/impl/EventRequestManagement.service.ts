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
import { ILocationBookingService } from '@/modules/location-booking/app/ILocationBooking.service';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';

@Injectable()
export class EventRequestManagementService
  extends CoreService
  implements IEventRequestManagementService
{
  constructor(
    private readonly configService: ConfigService<Environment>,
    @Inject(ILocationBookingService)
    private readonly locationBookingService: ILocationBookingService,
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

      // validate tags
      const tags = await tagRepository.countSelectableTagsById(dto.tagIds);
      if (tags !== dto.tagIds.length) {
        throw new BadRequestException(
          'One or more tags are invalid. Please check tag visibility.',
        );
      }

      // create location booking
      const locationBooking =
        await this.locationBookingService.createBooking_ForBusinessLocation({
          ...dto,
          locationId: dto.locationId,
          startDateTime: dto.startDateTime,
          endDateTime: dto.endDateTime,
          accountId: dto.accountId,
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
                tagIds: dto.tagIds,
              });
            return savedEventRequest;
          })
          // map to response
          .then((res) => this.mapTo(EventRequestResponseDto, res))
      );
    });
  }
}
