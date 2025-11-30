import { Exclude, Expose } from 'class-transformer';
import { LocationRequestStatus } from '@/common/constants/Location.constant';

@Exclude()
export class LocationRequestStatusCountDto {
  @Expose()
  status: LocationRequestStatus;

  @Expose()
  count: number;
}

