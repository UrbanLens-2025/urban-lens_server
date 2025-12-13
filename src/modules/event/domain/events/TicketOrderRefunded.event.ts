import { TicketOrderEntity } from '@/modules/event/domain/TicketOrder.entity';

export const TICKET_ORDER_REFUNDED_EVENT = 'event.ticket-order-refunded';

export class TicketOrderRefundedEvent {
  constructor(public readonly ticketOrder: TicketOrderEntity) {}
}
