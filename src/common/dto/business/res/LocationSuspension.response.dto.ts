import { Exclude, Expose, Type } from 'class-transformer';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { LocationSuspensionType } from '@/common/constants/LocationSuspensionType.constant';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';

@Exclude()
export class LocationSuspensionResponseDto {
  @Expose()
  id: string;
  @Expose()
  locationId: string;
  @Expose()
  suspensionType?: LocationSuspensionType | null;
  @Expose()
  @Type(() => LocationResponseDto)
  location?: LocationResponseDto | null;
  @Expose()
  suspensionReason?: string | null;
  @Expose()
  suspendedUntil?: Date | null;
  @Expose()
  suspendedById?: string | null;
  @Expose()
  @Type(() => AccountResponseDto)
  suspendedBy?: AccountResponseDto | null;
  @Expose()
  @Type(() => Date)
  createdAt: Date;
  @Expose()
  @Type(() => Date)
  updatedAt: Date;
}
