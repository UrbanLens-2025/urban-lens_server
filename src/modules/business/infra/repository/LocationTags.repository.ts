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
  });

export type LocationTagsRepository = ReturnType<typeof LocationTagsRepository>;
