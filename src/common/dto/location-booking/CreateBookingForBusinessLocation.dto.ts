export class CreateBookingForBusinessLocationDto {
  // transient fields
  accountId: string;

  // body
  locationId: string;
  startDateTime: Date;
  endDateTime: Date;
}
