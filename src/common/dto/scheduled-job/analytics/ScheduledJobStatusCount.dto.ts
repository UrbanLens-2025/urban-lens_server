import { Exclude, Expose } from 'class-transformer';
import { ScheduledJobStatus } from '@/common/constants/ScheduledJobStatus.constant';

@Exclude()
export class ScheduledJobStatusCountDto {
  @Expose()
  status: ScheduledJobStatus;

  @Expose()
  count: number;
}

