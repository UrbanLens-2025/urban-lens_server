import { DataSource, EntityManager } from 'typeorm';
import { TicketOrderDetailsEntity } from '@/modules/event/domain/TicketOrderDetails.entity';

export const TicketOrderDetailsRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(TicketOrderDetailsEntity).extend({});

export type TicketOrderDetailsRepository = ReturnType<
  typeof TicketOrderDetailsRepository
>;
