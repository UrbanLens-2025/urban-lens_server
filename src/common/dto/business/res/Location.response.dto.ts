import { Exclude, Expose, Type } from 'class-transformer';
import { LocationRequestStatus } from '@/common/constants/Location.constant';
import { BusinessResponseDto } from '@/common/dto/account/res/Business.response.dto';
import { LocationTagsResponseDto } from '@/common/dto/business/res/LocationTags.response.dto';
import { LocationOwnershipType } from '@/common/constants/LocationType.constant';

@Exclude()
export class LocationResponseDto {
  @Expose()
  id: string;

  @Expose()
  ownershipType: LocationOwnershipType;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  latitude: number;

  @Expose()
  longitude: number;

  @Expose()
  addressLine: string;

  @Expose()
  addressLevel1: string;

  @Expose()
  addressLevel2: string;

  @Expose()
  radiusMeters: number;

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
  isVisibleOnMap: boolean;

  @Expose()
  businessId: string;

  @Expose()
  @Type(() => BusinessResponseDto)
  business: BusinessResponseDto;

  @Expose()
  @Type(() => LocationTagsResponseDto)
  tags: LocationTagsResponseDto[];
}
