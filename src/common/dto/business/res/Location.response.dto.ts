import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { LocationRequestStatus } from '@/common/constants/Location.constant';
import { BusinessResponseDto } from '@/common/dto/account/res/Business.response.dto';
import { LocationTagsResponseDto } from '@/common/dto/business/res/LocationTags.response.dto';
import { LocationOwnershipType } from '@/common/constants/LocationType.constant';
import { LocationBookingConfigResponseDto } from '@/common/dto/location-booking/res/LocationBookingConfig.response.dto';
import { TagResponseDto } from '@/common/dto/account/res/TagResponse.dto';
import { LocationAvailabilityResponseDto } from '@/common/dto/location-booking/res/LocationAvailability.response.dto';

@Exclude()
export class LocationResponseDto {
  @Expose()
  id: string;

  type = 'location';

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
  @Transform(({ value }) => {
    if (!value || !Array.isArray(value)) {
      return undefined;
    }
    return value
      .map((locationTag: LocationTagsResponseDto) => locationTag?.tag)
      .filter(Boolean);
  })
  tags: TagResponseDto[];

  @Expose()
  @Type(() => LocationBookingConfigResponseDto)
  bookingConfig: LocationBookingConfigResponseDto;

  @Expose()
  @Type(() => LocationAvailabilityResponseDto)
  availabilities: LocationAvailabilityResponseDto[];

  @Expose()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return 0;
    return typeof value === 'string' ? parseFloat(value) : Number(value);
  })
  averageRating: number;

  @Expose()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return 0;
    return typeof value === 'string' ? parseInt(value, 10) : Number(value);
  })
  totalReviews: number;

  @Expose()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return 0;
    return typeof value === 'string' ? parseInt(value, 10) : Number(value);
  })
  totalCheckIns: number;

  @Expose()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return 0;
    return typeof value === 'string' ? parseInt(value, 10) : Number(value);
  })
  totalPosts: number;
}
