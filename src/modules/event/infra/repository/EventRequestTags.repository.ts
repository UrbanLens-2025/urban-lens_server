import { DataSource, EntityManager, Repository } from 'typeorm';
import { EventRequestTagsEntity } from '@/modules/event/domain/EventRequestTags.entity';

export const EventRequestTagsRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(EventRequestTagsEntity).extend({
    persistEntities(
      this: Repository<EventRequestTagsEntity>,
      payload: { tagCategoryIds: number[]; eventRequestId: string },
    ) {
      const entities = payload.tagCategoryIds.map((tagCategoryId) => {
        const entity = new EventRequestTagsEntity();
        entity.tagCategoryId = tagCategoryId;
        entity.eventRequestId = payload.eventRequestId;

        return entity;
      });

      return this.save(entities);
    },
  });

export type EventRequestTagsRepository = ReturnType<
  typeof EventRequestTagsRepository
>;
