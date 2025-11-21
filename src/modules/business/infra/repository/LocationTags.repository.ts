import { DataSource, EntityManager, Repository } from 'typeorm';
import { LocationTagsEntity } from '@/modules/business/domain/LocationTags.entity';

export const LocationTagsRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(LocationTagsEntity).extend({
    persistEntities(
      this: Repository<LocationTagsEntity>,
      payload: { tagIds: number[]; locationId: string },
    ) {
      const entities = payload.tagIds.map((tagId) => {
        const entity = new LocationTagsEntity();
        entity.tagId = tagId;
        entity.locationId = payload.locationId;
        return entity;
      });

      return this.save(entities);
    },

    findDuplicatesIncludingDeleted(
      this: Repository<LocationTagsEntity>,
      payload: { locationId: string; tagIds: number[] },
    ) {
      return this.createQueryBuilder('location_tag')
        .where('location_tag.location_id = :locationId', {
          locationId: payload.locationId,
        })
        .andWhere('location_tag.tag_id IN (:...tagIds)', {
          tagIds: payload.tagIds,
        })
        .withDeleted()
        .getMany();
    },
  });

export type LocationTagsRepository = ReturnType<typeof LocationTagsRepository>;
