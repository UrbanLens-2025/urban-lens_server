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
  @Type(() => Number)
  fineAmount: number;

  @Expose()
  fineReason: string;

  @Expose()
  @Type(() => Date)
  paidAt?: Date | null;

  @Expose()
  isActive: boolean;
}
