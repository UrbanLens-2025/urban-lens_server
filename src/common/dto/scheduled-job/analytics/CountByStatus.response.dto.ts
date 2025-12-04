import { Exclude, Expose, Type } from 'class-transformer';
import { ScheduledJobStatusCountDto } from '@/common/dto/scheduled-job/analytics/ScheduledJobStatusCount.dto';

@Exclude()
export class CountByStatusResponseDto {
  @Expose()
  @Type(() => ScheduledJobStatusCountDto)
  statusCounts: ScheduledJobStatusCountDto[];
}

