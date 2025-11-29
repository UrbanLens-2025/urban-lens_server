import { DataSource, EntityManager, Repository } from 'typeorm';
import { TicketOrderEntity } from '@/modules/event/domain/TicketOrder.entity';
import { EventTicketOrderStatus } from '@/common/constants/EventTicketOrderStatus.constant';

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

    async getTotalTicketsSold(
      this: Repository<TicketOrderEntity>,
      payload: { eventId: string; startDate: Date; endDate: Date },
    ) {
      const qb = await this.createQueryBuilder('order')
        .select('COALESCE(SUM(orderDetails.quantity), 0)', 'totalTicketsSold')
        .innerJoin('order.orderDetails', 'orderDetails')
        .where('order.eventId = :eventId', { eventId: payload.eventId })
        .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
          startDate: payload.startDate,
          endDate: payload.endDate,
        })
        .andWhere('order.status = :status', {
          status: EventTicketOrderStatus.PAID,
        })
        .getRawOne<{ totalTicketsSold: string | null }>();

      return Number(qb?.totalTicketsSold ?? 0);
    },

    async getTotalRevenue(
      this: Repository<TicketOrderEntity>,
      payload: { eventId: string; startDate: Date; endDate: Date },
    ) {
      const qb = await this.createQueryBuilder('order')
        .select('COALESCE(SUM(order.totalPaymentAmount), 0)', 'totalRevenue')
        .where('order.eventId = :eventId', { eventId: payload.eventId })
        .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
          startDate: payload.startDate,
          endDate: payload.endDate,
        })
        .andWhere('order.status = :status', {
          status: EventTicketOrderStatus.PAID,
        })
        .getRawOne<{ totalRevenue: string | null }>();

      return Number(qb?.totalRevenue ?? 0);
    },

    async getTicketsWithRevenue(
      this: Repository<TicketOrderEntity>,
      payload: { eventId: string; startDate: Date; endDate: Date },
    ) {
      const qb = await this.createQueryBuilder('order')
        .select(
          'et.id, et.display_name, COALESCE(SUM(etod.sub_total), 0) as total_revenue',
        )
        .innerJoin('order.orderDetails', 'orderDetails')
        .innerJoin('orderDetails.ticket', 'ticket')
        .where('order.eventId = :eventId', { eventId: payload.eventId })
        .andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
          startDate: payload.startDate,
          endDate: payload.endDate,
        })
        .andWhere('order.status = :status', {
          status: EventTicketOrderStatus.PAID,
        })
        .groupBy('et.id, et.display_name')
        .getRawMany<{
          id: string;
          displayName: string;
          totalRevenue: string | null;
        }>();

      return qb;
    },
  });

export type TicketOrderRepository = ReturnType<typeof TicketOrderRepository>;
