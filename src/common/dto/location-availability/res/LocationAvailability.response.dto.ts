import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { LocationAvailabilityStatus } from '@/common/constants/LocationAvailabilityStatus.constant';
import { LocationAvailabilitySource } from '@/common/constants/LocationAvailabilitySource.constant';

@Exclude()
export class LocationAvailabilityResponseDto {
  @Expose()
  id: number;

  @Expose()
  locationId: string;

  @Expose()
  createdById: string;

  @Expose()
  status: LocationAvailabilityStatus;

  @Expose()
  source: LocationAvailabilitySource;

  @Expose()
  note: string | null;

  @Expose()
  @Type(() => Date)
  @Transform(({ value }) => value?.toISOString())
  startDateTime: Date;

  @Expose()
  @Type(() => Date)
  @Transform(({ value }) => value?.toISOString())
  endDateTime: Date;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  createdAt: Date;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  updatedAt: Date;
}
