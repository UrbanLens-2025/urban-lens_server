import { DataSource, EntityManager } from 'typeorm';
import { EventTicketEntity } from '@/modules/event/domain/EventTicket.entity';

export const EventTicketRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(EventTicketEntity).extend({});

export type EventTicketRepository = ReturnType<typeof EventTicketRepository>;
