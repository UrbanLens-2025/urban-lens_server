import { CoreService } from '@/common/core/Core.service';
import { CreateLocationRequestFromBusinessDto } from '@/common/dto/business/CreateLocationRequestFromBusiness.dto';
import { ILocationRequestManagementService } from '@/modules/business/app/ILocationRequestManagement.service';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { mergeTagsWithCategories } from '@/common/utils/category-to-tags.util';
import { CategoryType } from '@/common/constants/CategoryType.constant';
import { LocationRequestResponseDto } from '@/common/dto/business/res/LocationRequest.response.dto';
import { LocationRequestRepository } from '@/modules/business/infra/repository/LocationRequest.repository';
import { BusinessRepositoryProvider } from '@/modules/account/infra/repository/Business.repository';
import { LocationRequestEntity } from '@/modules/business/domain/LocationRequest.entity';
import { LocationRequestStatus } from '@/common/constants/Location.constant';
import { DeleteResult, EntityManager, In, UpdateResult } from 'typeorm';
import { UpdateLocationRequestDto } from '@/common/dto/business/UpdateLocationRequest.dto';
import { CancelLocationRequestDto } from '@/common/dto/business/CancelLocationRequest.dto';
import { ProcessLocationRequestDto } from '@/common/dto/business/ProcessLocationRequest.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  LOCATION_REQUEST_APPROVED_EVENT,
  LocationRequestApprovedEvent,
} from '@/modules/business/domain/events/LocationRequestApproved.event';
import { LOCATION_REQUEST_REJECTED_EVENT } from '@/modules/business/domain/events/LocationRequestRejected.event';
import { LOCATION_REQUEST_NEEDS_MORE_INFO_EVENT } from '@/modules/business/domain/events/LocationRequestNeedsMoreInfo.event';
import { TagRepositoryProvider } from '@/modules/utility/infra/repository/Tag.repository';
import { LocationRequestTagsRepository } from '@/modules/business/infra/repository/LocationRequestTags.repository';
import { AddLocationRequestTagsDto } from '@/common/dto/business/AddLocationRequestTags.dto';
import { DeleteLocationRequestTagDto } from '@/common/dto/business/DeleteLocationRequestTag.dto';
import { LocationRequestTagsResponseDto } from '@/common/dto/business/res/LocationRequestTags.response.dto';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { LocationTagsRepository } from '@/modules/business/infra/repository/LocationTags.repository';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { LocationRequestType } from '@/common/constants/LocationRequestType.constant';
import { CreateLocationRequestFromUserDto } from '@/common/dto/business/CreateLocationRequestFromUser.dto';
import { UserProfileRepositoryProvider } from '@/modules/account/infra/repository/UserProfile.repository';
import { LocationOwnershipType } from '@/common/constants/LocationType.constant';
import { ILocationManagementService } from '@/modules/business/app/ILocationManagement.service';

@Injectable()
export class LocationRequestManagementService
  extends CoreService
  implements ILocationRequestManagementService
{
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
    @Inject(ILocationManagementService)
    private readonly locationManagementService: ILocationManagementService,
  ) {
    super();
  }

  createLocationRequestFromUser(
    dto: CreateLocationRequestFromUserDto,
  ): Promise<LocationRequestResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const locationRequestRepository = LocationRequestRepository(em);
      const userProfileRepository = UserProfileRepositoryProvider(em);
      const tagRepository = TagRepositoryProvider(em);
      const locationRequestTagRepository = LocationRequestTagsRepository(em);

      const userProfile = await userProfileRepository.findOneByOrFail({
        accountId: dto.createdById,
      });

      if (!userProfile.canSuggestLocation()) {
        throw new BadRequestException(
          'This user is not allowed to suggest a location',
        );
      }

      // Convert categories to tags
      const finalTagIds = await mergeTagsWithCategories(
        [], // No manual tags
        dto.categoryIds,
        CategoryType.LOCATION,
        this.dataSource,
      );

      if (finalTagIds.length === 0) {
        throw new BadRequestException(
          'Selected categories do not contain any valid tags',
        );
      }

      // validate tags
      const tagCountInDb =
        await tagRepository.countSelectableTagsById(finalTagIds);

      if (tagCountInDb !== finalTagIds.length) {
        throw new BadRequestException(
          'One or more tags from categories are invalid/not selectable',
        );
      }

      // confirm image uploads
      await this.fileStorageService.confirmUpload([...dto.locationImageUrls]);

      const locationRequest = this.mapTo_safe(LocationRequestEntity, dto);
      // TODO add automatic location validation process here
      locationRequest.status = LocationRequestStatus.AWAITING_ADMIN_REVIEW;
      locationRequest.type = LocationRequestType.USER_SUGGESTED;

      return (
        locationRequestRepository
          .save(locationRequest)
          // create tags
          .then(async (e) => {
            e.tags = await locationRequestTagRepository.persistEntities({
              tagIds: finalTagIds,
              locationRequestId: e.id,
            });

            return this.mapTo(LocationRequestResponseDto, e);
          })
      );
    });
  }

  createLocationRequestFromBusiness(
    dto: CreateLocationRequestFromBusinessDto,
  ): Promise<LocationRequestResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const locationRequestRepository = LocationRequestRepository(em);
      const businessProfileRepository = BusinessRepositoryProvider(em);
      const tagRepository = TagRepositoryProvider(em);
      const locationRequestTagRepository = LocationRequestTagsRepository(em);

      const businessProfile = await businessProfileRepository.findOneByOrFail({
        accountId: dto.createdById,
      });

      if (!businessProfile.canCreateLocation()) {
        throw new BadRequestException(
          'This business is not allowed to create a location',
        );
      }

      // Convert categories to tags
      const finalTagIds = await mergeTagsWithCategories(
        [], // No manual tags
        dto.categoryIds,
        CategoryType.LOCATION,
        this.dataSource,
      );

      if (finalTagIds.length === 0) {
        throw new BadRequestException(
          'Selected categories do not contain any valid tags',
        );
      }

      // validate tags
      const tagCountInDb =
        await tagRepository.countSelectableTagsById(finalTagIds);

      if (tagCountInDb !== finalTagIds.length) {
        throw new BadRequestException(
          'One or more tags from categories are invalid/not selectable',
        );
      }

      // confirm image uploads
      await this.fileStorageService.confirmUpload([
        ...dto.locationImageUrls,
        ...dto.locationValidationDocuments.flatMap((d) => d.documentImageUrls),
      ]);

      const locationRequest = this.mapTo_safe(LocationRequestEntity, dto);
      // TODO add automatic location validation process here
      locationRequest.status = LocationRequestStatus.AWAITING_ADMIN_REVIEW;
      locationRequest.type = LocationRequestType.BUSINESS_OWNED;

      return (
        locationRequestRepository
          .save(locationRequest)
          // create tags
          .then(async (e) => {
            e.tags = await locationRequestTagRepository.persistEntities({
              tagIds: finalTagIds,
              locationRequestId: e.id,
            });

            return this.mapTo(LocationRequestResponseDto, e);
          })
      );
    });
  }

  addLocationRequestTags(
    dto: AddLocationRequestTagsDto,
  ): Promise<LocationRequestTagsResponseDto[]> {
    return this.ensureTransaction(null, async (em) => {
      const locationRequestRepository = LocationRequestRepository(em);
      const tagRepository = TagRepositoryProvider(em);
      const locationRequestTagRepository = LocationRequestTagsRepository(em);

      const locationRequest = await locationRequestRepository.findOneByOrFail({
        id: dto.locationRequestId,
        createdById: dto.accountId,
      });

      if (!locationRequest.canBeUpdated()) {
        throw new BadRequestException(
          'This location request cannot be updated',
        );
      }

      // validate tags
      const existsSelectedTags = await tagRepository.countSelectableTagsById(
        dto.tagIds,
      );
      if (!existsSelectedTags) {
        throw new BadRequestException(
          'One or more provided tags are invalid/not selectable',
        );
      }

      return await locationRequestTagRepository
        .persistEntities({
          tagIds: dto.tagIds,
          locationRequestId: locationRequest.id,
        })
        .then((e) => this.mapToArray(LocationRequestTagsResponseDto, e));
    });
  }

  deleteLocationRequestTag(
    dto: DeleteLocationRequestTagDto,
  ): Promise<DeleteResult> {
    return this.ensureTransaction(null, async (em) => {
      const locationRequestTagRepository = LocationRequestTagsRepository(em);

      return locationRequestTagRepository.delete({
        id: In(dto.tagIds),
        locationRequest: {
          id: dto.locationRequestId,
          createdById: dto.accountId,
        },
      });
    });
  }

  updateLocationRequest(dto: UpdateLocationRequestDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const locationRequestRepository = LocationRequestRepository(em);

      const locationRequest = await locationRequestRepository.findOneByOrFail({
        id: dto.locationRequestId,
        createdById: dto.accountId,
      });

      if (!locationRequest.canBeUpdated()) {
        throw new BadRequestException(
          'This location request cannot be updated',
        );
      }

      await this.fileStorageService.confirmUpload([
        ...(dto.locationImageUrls ?? []),
        ...(dto.locationValidationDocuments?.flatMap(
          (d) => d.documentImageUrls,
        ) ?? []),
      ]);

      const updatedLocationRequest = this.mapTo_safe(
        LocationRequestEntity,
        dto,
      );
      updatedLocationRequest.status =
        LocationRequestStatus.AWAITING_ADMIN_REVIEW;

      return locationRequestRepository.update(
        { id: locationRequest.id },
        updatedLocationRequest,
      );
    });
  }

  cancelLocationRequest(dto: CancelLocationRequestDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const locationRequestRepository = LocationRequestRepository(em);

      const locationRequest = await locationRequestRepository.findOneByOrFail({
        id: dto.locationRequestId,
        createdById: dto.accountId,
      });

      if (!locationRequest.canBeUpdated()) {
        throw new BadRequestException(
          'This location request cannot be cancelled',
        );
      }

      locationRequest.status = LocationRequestStatus.CANCELLED_BY_BUSINESS;

      return locationRequestRepository.update(
        { id: dto.locationRequestId },
        locationRequest,
      );
    });
  }

  processLocationRequest(
    dto: ProcessLocationRequestDto,
  ): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const locationRequestRepository = LocationRequestRepository(em);

      const locationRequest = await locationRequestRepository.findOneByOrFail({
        id: dto.locationRequestId,
      });

      if (!locationRequest.canBeProcessed()) {
        throw new BadRequestException(
          'This location request cannot be updated',
        );
      }

      locationRequest.processedById = dto.accountId;
      locationRequest.status = dto.status;
      locationRequest.adminNotes = dto.adminNotes || null;

      return (
        locationRequestRepository
          // update location request
          .update(
            {
              id: dto.locationRequestId,
            },
            locationRequest,
          )
          // if approved, convert to location
          .then(async (res) => {
            if (dto.status === LocationRequestStatus.APPROVED) {
              await this.locationManagementService.convertLocationRequestToLocationEntity(
                em,
                locationRequest,
              );
            }
            return res;
          })
          // fire events
          .then((res) => {
            switch (dto.status) {
              case LocationRequestStatus.APPROVED:
                this.eventEmitter.emit(LOCATION_REQUEST_APPROVED_EVENT, {
                  locationRequest,
                } satisfies LocationRequestApprovedEvent);
                break;
              case LocationRequestStatus.REJECTED:
                this.eventEmitter.emit(LOCATION_REQUEST_REJECTED_EVENT, {
                  locationRequest,
                } satisfies LocationRequestApprovedEvent);
                break;
            }

            return res;
          })
      );
    });
  }
}
