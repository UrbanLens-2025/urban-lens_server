import { Exclude, Expose, Type } from 'class-transformer';
import { LocationVoucherType } from '@/modules/gamification/domain/LocationVoucher.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @Expose()
  @Type(() => Object)
  statistics?: {
    total: number;
    used: number;
    remaining: number;
  };
}
