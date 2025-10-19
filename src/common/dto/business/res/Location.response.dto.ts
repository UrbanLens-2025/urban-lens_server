import { Exclude, Expose, Type } from 'class-transformer';
import { LocationRequestStatus } from '@/common/constants/Location.constant';
import { BusinessResponseDto } from '@/common/dto/account/res/Business.response.dto';

@Exclude()
export class LocationResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  latitude: number;

  @Expose()
  longitude: number;

  @Expose({ name: 'address_line' })
  addressLine: string;

  @Expose({ name: 'address_level_1' })
  addressLevel1: string;

  @Expose({ name: 'address_level_2' })
  addressLevel2: string;

  @Expose()
  imageUrl?: string[];

  @Expose()
  status: LocationRequestStatus;

  @Expose()
  adminNotes?: string | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  businessId: string;

  @Expose()
  @Type(() => BusinessResponseDto)
  business: BusinessResponseDto;
}
