export class InitiateEventBookingPaymentDto {
  eventId: string;
  locationBookingId: string;
  accountId: string;
  accountName: string;
  ipAddress: string;
  returnUrl: string;
}
