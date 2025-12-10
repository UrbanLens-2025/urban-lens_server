export const BOOKING_FORCE_CANCELLED_EVENT = 'booking.force-cancelled';

export class BookingForceCancelledEvent {
  constructor(public readonly bookingId: string) {}
}
