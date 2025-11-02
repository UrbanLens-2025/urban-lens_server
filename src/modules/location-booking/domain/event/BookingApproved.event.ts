import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';

export const BOOKING_APPROVED_EVENT = 'location-booking.booking-approved';
export class BookingApprovedEvent {
  constructor(public readonly booking: LocationBookingEntity) {}
}
