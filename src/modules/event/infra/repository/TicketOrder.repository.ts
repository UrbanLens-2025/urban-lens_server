import { DataSource, EntityManager, Repository } from 'typeorm';
import { TicketOrderEntity } from '@/modules/event/domain/TicketOrder.entity';

export const TicketOrderRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(TicketOrderEntity).extend({
    /**
     * Create query builder for orders in a specific event
     * Joins through orderDetails -> ticket -> event
     */
    createQueryBuilderForOrdersInEvent(
      this: Repository<TicketOrderEntity>,
      eventId: string,
    ) {
      return this.createQueryBuilder('order')
        .innerJoin('order.orderDetails', 'orderDetails')
        .innerJoin('orderDetails.ticket', 'ticket')
        .leftJoinAndSelect('order.createdBy', 'createdBy')
        .leftJoinAndSelect(
          'order.referencedTransaction',
          'referencedTransaction',
        )
        .leftJoinAndSelect('order.orderDetails', 'orderDetails')
        .leftJoinAndSelect('orderDetails.ticket', 'ticket')
        .where('ticket.event_id = :eventId', { eventId })
        .distinct(true);
    },

    /**
     * Find order by ID that belongs to a specific event
     * Uses query builder to validate event association through nested relations
     */
    async findOrderInEventById(
      this: Repository<TicketOrderEntity>,
      orderId: string,
      eventId: string,
    ) {
      return this.createQueryBuilder('order')
        .innerJoin('order.orderDetails', 'orderDetails')
        .innerJoin('orderDetails.ticket', 'ticket')
        .where('order.id = :orderId', { orderId })
        .andWhere('ticket.event_id = :eventId', { eventId })
        .leftJoinAndSelect('order.createdBy', 'createdBy')
        .leftJoinAndSelect(
          'order.referencedTransaction',
          'referencedTransaction',
        )
        .leftJoinAndSelect('order.orderDetails', 'orderDetails')
        .leftJoinAndSelect('orderDetails.ticket', 'ticket')
        .leftJoinAndSelect('ticket.event', 'event')
        .getOneOrFail();
    },
  });

export type TicketOrderRepository = ReturnType<typeof TicketOrderRepository>;
