export const BOOKING_REJECTED_EVENT = 'location-booking.booking-rejected';
export class BookingRejectedEvent {
  constructor(public readonly bookingId: string) {}
}

