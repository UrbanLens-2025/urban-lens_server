export const ILocationBookingCreationService = Symbol(
  'ILocationBookingCreationService',
);
export interface ILocationBookingCreationService {
  createLocationBooking(): Promise<unknown>;
}
