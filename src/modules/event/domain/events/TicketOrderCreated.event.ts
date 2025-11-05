import { TicketOrderEntity } from '@/modules/event/domain/TicketOrder.entity';

export class TicketOrderCreatedEvent {
  constructor(order: TicketOrderEntity) {}
}

export const TICKET_ORDER_CREATED_EVENT = 'ticket.order.created';
