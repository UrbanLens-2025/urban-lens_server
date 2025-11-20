import { CoreService } from '@/common/core/Core.service';
import { UpdateLocationDto } from '@/common/dto/business/UpdateLocation.dto';
import { ILocationManagementService } from '@/modules/business/app/ILocationManagement.service';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityManager, In, UpdateResult } from 'typeorm';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { AddLocationTagDto } from '@/common/dto/business/AddLocationTag.dto';
import { RemoveLocationTagDto } from '@/common/dto/business/RemoveLocationTag.dto';
import { LocationTagsResponseDto } from '@/common/dto/business/res/LocationTags.response.dto';
import { TagRepositoryProvider } from '@/modules/utility/infra/repository/Tag.repository';
import { LocationTagsRepository } from '@/modules/business/infra/repository/LocationTags.repository';
import { LocationTagsEntity } from '@/modules/business/domain/LocationTags.entity';
import { ForceUpdateLocationDto } from '@/common/dto/business/ForceUpdateLocation.dto';
import { CreatePublicLocationDto } from '@/common/dto/business/CreatePublicLocation.dto';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { LocationOwnershipType } from '@/common/constants/LocationType.constant';
import { mergeTagsWithCategories } from '@/common/utils/category-to-tags.util';
import { CategoryType } from '@/common/constants/CategoryType.constant';
import { TagCategoryEntity } from '@/modules/utility/domain/TagCategory.entity';
import { LocationRequestEntity } from '@/modules/business/domain/LocationRequest.entity';
import { LocationRequestTagsRepository } from '@/modules/business/infra/repository/LocationRequestTags.repository';
import { LocationRequestType } from '@/common/constants/LocationRequestType.constant';
import { ILocationAnalyticsService } from '@/modules/business/app/ILocationAnalytics.service';
import { ILocationBookingConfigManagementService } from '@/modules/location-booking/app/ILocationBookingConfigManagement.service';
import { CreateLocationEntityDto } from '@/common/dto/business/CreateLocationEntity.dto';

@Injectable()
export class LocationManagementService
  extends CoreService
  implements ILocationManagementService
{
  constructor(
    @Inject(ILocationAnalyticsService)
    private readonly locationAnalyticsService: ILocationAnalyticsService,
    @Inject(ILocationBookingConfigManagementService)
    private readonly locationBookingConfigManagementService: ILocationBookingConfigManagementService,
  ) {
    super();
  }

  addTag(dto: AddLocationTagDto): Promise<LocationTagsResponseDto[]> {
    return this.ensureTransaction(null, async (em) => {
      const locationRepository = LocationRepositoryProvider(em);
      const tagRepository = TagRepositoryProvider(em);
      const locationTagsRepository = LocationTagsRepository(em);

      // validate location
      const location = await locationRepository.findOneOrFail({
        where: {
          id: dto.locationId,
          businessId: dto.accountId,
        },
      });

      // validate tags
      const tags = await tagRepository.countSelectableTagsById(dto.tagIds);
      if (tags !== dto.tagIds.length) {
        throw new BadRequestException(
          'One or more tags are invalid or not selectable',
        );
      }

      // check for existing tags
      const duplicates =
        await locationTagsRepository.findDuplicatesIncludingDeleted({
          locationId: location.id,
          tagIds: dto.tagIds,
        });

      // sort duplicates into deleted and undeleted
      const sortedDuplicates: Record<
        'deleted' | 'undeleted',
        LocationTagsEntity[]
      > = duplicates.reduce(
        (acc, curr) => {
          if (curr.deletedAt) {
            acc.deleted.push(curr);
          } else {
            acc.undeleted.push(curr);
          }
          return acc;
        },
        {
          undeleted: [] as LocationTagsEntity[],
          deleted: [] as LocationTagsEntity[],
        },
      );

      if (sortedDuplicates.undeleted.length > 0) {
        throw new BadRequestException('One or more tags are already assigned');
      }

      if (sortedDuplicates.deleted.length > 0) {
        // restore deleted tags
        const idsToRestore = sortedDuplicates.deleted.map((d) => d.id);
        await locationTagsRepository.restore(idsToRestore);
      }

      // create location tags
      const tagIdsToPersist = dto.tagIds.filter(
        (tagId) => !sortedDuplicates.deleted.some((dup) => dup.tagId === tagId),
      );

      return await locationTagsRepository
        .persistEntities({
          tagIds: tagIdsToPersist,
          locationId: location.id,
        })
        .then((e) =>
          this.mapToArray(LocationTagsResponseDto, [
            ...e,
            ...sortedDuplicates.deleted,
          ]),
        );
    });
  }

  softRemoveTag(dto: RemoveLocationTagDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const locationRepository = LocationRepositoryProvider(em);
      const locationTagsRepository = LocationTagsRepository(em);

      // validate location
      await locationRepository.findOneOrFail({
        where: {
          id: dto.locationId,
          businessId: dto.accountId,
        },
      });

      // delete location tags
      return await locationTagsRepository.softDelete({
        locationId: dto.locationId,
        tagId: In(dto.tagIds),
      });
    });
  }

  updateOwnedLocation(dto: UpdateLocationDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const locationRepository = LocationRepositoryProvider(em);
      await locationRepository.findOneOrFail({
        where: {
          id: dto.locationId,
          businessId: dto.accountId,
        },
      });

      const updatedLocation = this.mapTo_safe(LocationEntity, dto);
      updatedLocation.updatedById = dto.accountId;
      return locationRepository.update({ id: dto.locationId }, updatedLocation);
    });
  }

  forceUpdateLocation(dto: ForceUpdateLocationDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const locationRepository = LocationRepositoryProvider(em);
      await locationRepository.findOneOrFail({
        where: {
          id: dto.locationId,
        },
      });

      const updatedLocation = this.mapTo_safe(LocationEntity, dto);
      updatedLocation.updatedById = dto.accountId;
      return locationRepository.update({ id: dto.locationId }, updatedLocation);
    });
  }

  createPublicLocation(
    dto: CreatePublicLocationDto,
  ): Promise<LocationResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const locationRepository = LocationRepositoryProvider(em);
      const locationTagRepository = LocationTagsRepository(em);
      const tagRepository = TagRepositoryProvider(em);
      const categoryRepository = em.getRepository(TagCategoryEntity);

      // Validate categories exist
      const categories = await categoryRepository.find({
        where: {
          id: In(dto.categoryIds),
        },
      });

      if (categories.length !== dto.categoryIds.length) {
        const foundIds = categories.map((c) => c.id);
        const missingIds = dto.categoryIds.filter(
          (id) => !foundIds.includes(id),
        );
        throw new BadRequestException(
          `One or more categories not found: ${missingIds.join(', ')}`,
        );
      }

      // Validate categories have LOCATION type
      const invalidCategories = categories.filter(
        (c) =>
          !c.applicableTypes?.includes(CategoryType.LOCATION) &&
          !c.applicableTypes?.includes(CategoryType.ALL),
      );

      if (invalidCategories.length > 0) {
        const invalidNames = invalidCategories.map((c) => c.name).join(', ');
        throw new BadRequestException(
          `The following categories are not applicable for LOCATION type: ${invalidNames}`,
        );
      }

      // Convert categories to tags
      const finalTagIds = await mergeTagsWithCategories(
        [], // No manual tags, only from categories
        dto.categoryIds,
        CategoryType.LOCATION,
        this.dataSource,
      );

      if (finalTagIds.length === 0) {
        const categoryNames = categories.map((c) => c.name).join(', ');
        throw new BadRequestException(
          `Selected categories (${categoryNames}) do not contain any valid tags with positive scores. Please ensure categories have tag_score_weights configured.`,
        );
      }

      // validate tags
      const countTags =
        await tagRepository.countSelectableTagsById(finalTagIds);
      if (countTags !== finalTagIds.length) {
        throw new BadRequestException(
          'One or more tags are invalid or not selectable',
        );
      }

      const newLocation = this.mapTo_safe(LocationEntity, dto);
      newLocation.ownershipType = LocationOwnershipType.PUBLIC_PLACE;

      const savedLocation = await locationRepository.save(newLocation);

      // save tags
      await locationTagRepository.persistEntities({
        locationId: savedLocation.id,
        tagIds: finalTagIds,
      });

      // Reload location with tags and tag relations
      const locationWithTags = await locationRepository.findOne({
        where: { id: savedLocation.id },
        relations: ['tags', 'tags.tag'],
      });

      if (!locationWithTags) {
        throw new BadRequestException('Failed to create location');
      }

      return this.mapTo(LocationResponseDto, locationWithTags);
    });
  }

  convertLocationRequestToLocationEntity(
    em: EntityManager,
    locationRequest: LocationRequestEntity,
  ): Promise<LocationEntity> {
    const locationRepository = LocationRepositoryProvider(em);
    const locationRequestTagsRepository = LocationRequestTagsRepository(em);
    const locationTagsRepository = LocationTagsRepository(em);

    const location = new LocationEntity();

    switch (locationRequest.type) {
      case LocationRequestType.BUSINESS_OWNED: {
        location.ownershipType = LocationOwnershipType.OWNED_BY_BUSINESS;
        location.name = locationRequest.name;
        location.description = locationRequest.description;
        location.addressLine = locationRequest.addressLine;
        location.addressLevel1 = locationRequest.addressLevel1;
        location.addressLevel2 = locationRequest.addressLevel2;
        location.latitude = locationRequest.latitude;
        location.longitude = locationRequest.longitude;
        location.imageUrl = locationRequest.locationImageUrls;
        location.businessId = locationRequest.createdById;
        location.sourceLocationRequestId = locationRequest.id;
        location.radiusMeters = locationRequest.radiusMeters;
        location.isVisibleOnMap = false; // default not visible. User must update to make it visible
        break;
      }
      case LocationRequestType.USER_SUGGESTED: {
        location.ownershipType = LocationOwnershipType.PUBLIC_PLACE;
        location.name = locationRequest.name;
        location.description = locationRequest.description;
        location.addressLine = locationRequest.addressLine;
        location.addressLevel1 = locationRequest.addressLevel1;
        location.addressLevel2 = locationRequest.addressLevel2;
        location.latitude = locationRequest.latitude;
        location.longitude = locationRequest.longitude;
        location.imageUrl = locationRequest.locationImageUrls;
        location.sourceLocationRequestId = locationRequest.id;
        location.radiusMeters = locationRequest.radiusMeters;
        location.isVisibleOnMap = false; // default not visible. User must update to make it visible
        break;
      }
      default: {
        throw new InternalServerErrorException(
          'Location Request Type not supported for mapping to Location',
        );
      }
    }

    return (
      locationRepository
        .save(location)
        // transfer tags to new location
        .then(async (savedLocation) => {
          const locationRequestTags = await locationRequestTagsRepository.find({
            where: {
              locationRequestId: locationRequest.id,
            },
          });

          savedLocation.tags = await locationTagsRepository.persistEntities({
            tagIds: locationRequestTags.map((t) => t.tagId),
            locationId: savedLocation.id,
          });

          return savedLocation;
        })
        // create location booking config
        .then(async (savedLocation) => {
          await this.locationBookingConfigManagementService.createDefaultLocationBookingConfig(
            {
              locationId: savedLocation.id,
              businessId: savedLocation.businessId,
            },
          );
          return savedLocation;
        })
        // create analytics
        .then(async (savedLocation) => {
          await this.locationAnalyticsService.createLocationAnalyticsEntity({
            locationId: savedLocation.id,
            entityManager: em,
          });
          return savedLocation;
        })
    );
  }
}
