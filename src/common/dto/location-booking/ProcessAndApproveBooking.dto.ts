import { IsNotEmpty, IsUUID } from 'class-validator';

export class ProcessAndApproveBookingDto {
  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  @IsNotEmpty()
  @IsUUID()
  bookingId: string;
}

