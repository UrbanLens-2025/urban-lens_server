export const EVENT_ATTENDANCE_REFUNDED = 'event.attendance.refunded';

export class EventAttendanceRefundedEvent {
  constructor(public readonly eventAttendanceIds: string[]) {}
}
