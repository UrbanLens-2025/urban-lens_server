import { Exclude, Expose, Type } from 'class-transformer';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';

@Exclude()
export class LocationBookingConfigResponseDto {
  @Expose()
  locationId: string;

  @Expose()
  allowBooking: boolean;

  @Expose()
  baseBookingPrice: number;

  @Expose()
  currency: SupportedCurrency;

  @Expose()
  minBookingDurationMinutes: number;

  @Expose()
  maxBookingDurationMinutes: number;

  @Expose()
  minGapBetweenBookingsMinutes: number;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  @Type(() => Date)
  deletedAt?: Date | null;
}
