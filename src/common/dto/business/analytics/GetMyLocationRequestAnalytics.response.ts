import { Exclude, Expose, Type } from 'class-transformer';
import { LocationRequestStatusCountDto } from '@/common/dto/business/analytics/LocationRequestStatusCount.dto';

@Exclude()
export class GetMyLocationRequestAnalyticsResponseDto {
  @Expose()
  @Type(() => LocationRequestStatusCountDto)
  statusCounts: LocationRequestStatusCountDto[];
}
