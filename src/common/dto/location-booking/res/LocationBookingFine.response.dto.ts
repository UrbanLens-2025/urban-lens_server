import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { Expose, Type } from 'class-transformer';

export class LocationBookingFineResponseDto {
  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  createdById: string;

  @Expose()
  @Type(() => AccountResponseDto)
  createdBy: AccountResponseDto;

  @Expose()
  updatedById?: string | null;

  @Expose()
  @Type(() => AccountResponseDto)
  updatedBy?: AccountResponseDto | null;

  @Expose()
  bookingId: string;

  @Expose()
  fineAmount: number;

  @Expose()
  fineReason: string;

  @Expose()
  @Type(() => Date)
  paidAt: Date;

  @Expose()
  isActive: boolean;
}
