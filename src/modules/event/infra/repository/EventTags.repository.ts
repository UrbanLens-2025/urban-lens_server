import { DataSource, EntityManager, Repository } from 'typeorm';
import { EventTagsEntity } from '@/modules/event/domain/EventTags.entity';

export const EventTagsRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(EventTagsEntity).extend({
    persistEntities(
      this: Repository<EventTagsEntity>,
      payload: { tagIds: number[]; eventId: string },
    ) {
      const entities = payload.tagIds.map((tagId) => {
        const entity = new EventTagsEntity();
        entity.tagId = tagId;
        entity.eventId = payload.eventId;

        return entity;
      });

      return this.save(entities);
    },

    findDuplicatesIncludingDeleted(
      this: Repository<EventTagsEntity>,
      payload: { eventId: string; tagIds: number[] },
    ) {
      return this.createQueryBuilder('event_tag')
        .where('event_tag.event_id = :eventId', {
          eventId: payload.eventId,
        })
        .andWhere('event_tag.tag_id IN (:...tagIds)', {
          tagIds: payload.tagIds,
        })
        .withDeleted()
        .getMany();
    },
  });

export type EventTagsRepository = ReturnType<typeof EventTagsRepository>;
