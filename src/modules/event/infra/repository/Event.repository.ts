import { DataSource, EntityManager } from 'typeorm';
import { EventEntity } from '@/modules/event/domain/Event.entity';

export const EventRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(EventEntity).extend({});

export type EventRepository = ReturnType<typeof EventRepository>;
