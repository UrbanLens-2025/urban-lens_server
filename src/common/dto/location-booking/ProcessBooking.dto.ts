import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessBookingDto {
  accountId: string;
  bookingId: string;

  @ApiProperty({
    enum: [LocationBookingStatus.APPROVED, LocationBookingStatus.REJECTED],
  })
  @IsNotEmpty()
  @IsEnum([LocationBookingStatus.APPROVED, LocationBookingStatus.REJECTED])
  status: LocationBookingStatus;
}
