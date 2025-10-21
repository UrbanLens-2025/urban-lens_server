import { CoreService } from '@/common/core/Core.service';
import { UpdateLocationDto } from '@/common/dto/business/UpdateLocation.dto';
import { ILocationManagementService } from '@/modules/business/app/ILocationManagement.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { In, UpdateResult } from 'typeorm';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { AddLocationTagDto } from '@/common/dto/business/AddLocationTag.dto';
import { RemoveLocationTagDto } from '@/common/dto/business/RemoveLocationTag.dto';
import { LocationTagsResponseDto } from '@/common/dto/business/res/LocationTags.response.dto';
import { TagRepositoryProvider } from '@/modules/account/infra/repository/Tag.repository';
import { LocationTagsRepository } from '@/modules/business/infra/repository/LocationTags.repository';
import { LocationTagsEntity } from '@/modules/business/domain/LocationTags.entity';
import { ForceUpdateLocationDto } from '@/common/dto/business/ForceUpdateLocation.dto';
import { CreatePublicLocationDto } from '@/common/dto/business/CreatePublicLocation.dto';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { LocationOwnershipType } from '@/common/constants/LocationType.constant';

@Injectable()
export class LocationManagementService
  extends CoreService
  implements ILocationManagementService
{
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

      // validate tags
      const countTags = await tagRepository.countSelectableTagsById(dto.tagIds);
      if (countTags !== dto.tagIds.length) {
        throw new BadRequestException(
          'One or more tags are invalid or not selectable',
        );
      }

      const newLocation = this.mapTo_safe(LocationEntity, dto);
      newLocation.ownershipType = LocationOwnershipType.PUBLIC_PLACE;

      return (
        locationRepository
          .save(newLocation)
          // save tags
          .then(async (res) => {
            res.tags = await locationTagRepository.persistEntities({
              locationId: res.id,
              tagIds: dto.tagIds,
            });
            return res;
          })
          .then((res) => this.mapTo(LocationResponseDto, res))
      );
    });
  }
}
