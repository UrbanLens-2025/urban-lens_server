import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { LocationVoucherResponseDto } from './LocationVoucher.response.dto';
import { LocationResponseDto } from '../business/res/Location.response.dto';

@Exclude()
export class UserVoucherResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => LocationVoucherResponseDto)
  voucher: LocationVoucherResponseDto;

  @Expose()
  userVoucherCode: string;

  @Expose()
  pointSpent: number;

  @Expose()
  @Type(() => Date)
  usedAt: Date | null;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Transform(({ obj }) => obj.voucher?.location)
  @Type(() => LocationResponseDto)
  location?: LocationResponseDto;

  // Computed fields
  @Expose()
  get isUsed(): boolean {
    return this.usedAt !== null;
  }

  @Expose()
  get isExpired(): boolean {
    if (!this.voucher?.endDate) return false;
    return new Date() > new Date(this.voucher.endDate);
  }

  @Expose()
  get isValid(): boolean {
    return !this.isUsed && !this.isExpired;
  }
}
