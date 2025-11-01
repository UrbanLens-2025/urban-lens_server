import { DataSource, EntityManager } from 'typeorm';
import { EventRequestEntity } from '@/modules/event/domain/EventRequest.entity';

export const EventRequestRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(EventRequestEntity).extend({});

export type EventRequestRepository = ReturnType<typeof EventRequestRepository>;
