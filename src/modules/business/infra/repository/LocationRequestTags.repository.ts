import { DataSource, EntityManager, Repository } from 'typeorm';
import { LocationRequestTagsEntity } from '@/modules/business/domain/LocationRequestTags.entity';

export const LocationRequestTagsRepository = (
  ctx: DataSource | EntityManager,
) =>
  ctx.getRepository(LocationRequestTagsEntity).extend({
    persistEntities(
      this: Repository<LocationRequestTagsEntity>,
      payload: { tagIds: number[]; locationRequestId: string },
    ) {
      const entities = payload.tagIds.map((tagId) => {
        const entity = new LocationRequestTagsEntity();
        entity.tagId = tagId;
        entity.locationRequestId = payload.locationRequestId;
        return entity;
      });

      return this.save(entities);
    },
  });

export type LocationRequestTagsRepository = ReturnType<
  typeof LocationRequestTagsRepository
>;
