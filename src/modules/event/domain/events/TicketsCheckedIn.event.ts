import { EventAttendanceEntity } from '@/modules/event/domain/EventAttendance.entity';

export const TICKETS_CHECKED_IN_EVENT = 'tickets.checked.in';

export class TicketsCheckedInEvent {
  constructor(
    private readonly ticketOrderId: string,
    private readonly eventAttendances: EventAttendanceEntity[],
  ) {}
}
