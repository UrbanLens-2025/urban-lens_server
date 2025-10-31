import { Exclude, Expose } from 'class-transformer';
import { LocationVoucherType } from '@/modules/gamification/domain/LocationVoucher.entity';

@Exclude()
export class LocationVoucherResponseDto {
  @Expose()
  id: string;

  @Expose()
  locationId: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  voucherCode: string;

  @Expose()
  imageUrl: string | null;

  @Expose()
  pricePoint: number;

  @Expose()
  maxQuantity: number;

  @Expose()
  userRedeemedLimit: number;

  @Expose()
  voucherType: LocationVoucherType;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
