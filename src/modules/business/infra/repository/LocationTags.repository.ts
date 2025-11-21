import { DataSource, EntityManager, Repository } from 'typeorm';
import { LocationTagsEntity } from '@/modules/business/domain/LocationTags.entity';

export const LocationTagsRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(LocationTagsEntity).extend({
    persistEntities(
      this: Repository<LocationTagsEntity>,
      payload: { tagCategoryIds: number[]; locationId: string },
    ) {
      const entities = payload.tagCategoryIds.map((tagCategoryId) => {
        const entity = new LocationTagsEntity();
        entity.tagCategoryId = tagCategoryId;
        entity.locationId = payload.locationId;
        return entity;
      });

      return this.save(entities);
    },

    findDuplicatesIncludingDeleted(
      this: Repository<LocationTagsEntity>,
      payload: { locationId: string; tagCategoryIds: number[] },
    ) {
      return this.createQueryBuilder('location_tag')
        .where('location_tag.location_id = :locationId', {
          locationId: payload.locationId,
        })
        .andWhere('location_tag.tag_category_id IN (:...tagCategoryIds)', {
          tagCategoryIds: payload.tagCategoryIds,
        })
        .withDeleted()
        .getMany();
    },
  });

export type LocationTagsRepository = ReturnType<typeof LocationTagsRepository>;
