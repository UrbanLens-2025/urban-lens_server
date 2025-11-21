import { DataSource, EntityManager, Repository } from 'typeorm';
import { EventTagsEntity } from '@/modules/event/domain/EventTags.entity';

export const EventTagsRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(EventTagsEntity).extend({
    persistEntities(
      this: Repository<EventTagsEntity>,
      payload: { tagCategoryIds: number[]; eventId: string },
    ) {
      const entities = payload.tagCategoryIds.map((tagCategoryId) => {
        const entity = new EventTagsEntity();
        entity.tagCategoryId = tagCategoryId;
        entity.eventId = payload.eventId;

        return entity;
      });

      return this.save(entities);
    },

    findDuplicatesIncludingDeleted(
      this: Repository<EventTagsEntity>,
      payload: { eventId: string; tagCategoryIds: number[] },
    ) {
      return this.createQueryBuilder('event_tag')
        .where('event_tag.event_id = :eventId', {
          eventId: payload.eventId,
        })
        .andWhere('event_tag.tag_category_id IN (:...tagCategoryIds)', {
          tagCategoryIds: payload.tagCategoryIds,
        })
        .withDeleted()
        .getMany();
    },
  });

export type EventTagsRepository = ReturnType<typeof EventTagsRepository>;
