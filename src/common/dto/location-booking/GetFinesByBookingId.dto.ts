import { Exclude } from 'class-transformer';

export class GetFinesByBookingIdDto {
  @Exclude()
  bookingId: string;
}
