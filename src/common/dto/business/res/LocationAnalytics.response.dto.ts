import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { Exclude, Expose, Transform, Type } from 'class-transformer';

@Exclude()
export class LocationAnalyticsResponseDto {
  @Expose()
  id: string;

  @Expose()
  locationId: string;

  @Expose()
  @Transform(({ value }) => Number(value) || 0)
  totalPosts: number;

  @Expose()
  @Transform(({ value }) => Number(value) || 0)
  totalCheckIns: number;

  @Expose()
  @Transform(({ value }) => Number(value) || 0)
  totalReviews: number;

  @Expose()
  @Transform(({ value }) => Number(value) || 0)
  averageRating: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => LocationResponseDto)
  location: LocationResponseDto;
}
