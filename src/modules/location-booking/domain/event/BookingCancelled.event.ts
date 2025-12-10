export const BOOKING_CANCELLED_EVENT = 'booking.cancelled';

export class BookingCancelledEvent {
  constructor(public readonly bookingId: string) {}
}
