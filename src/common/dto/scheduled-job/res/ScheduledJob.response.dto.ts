import { Exclude, Expose, Type } from 'class-transformer';
import { ScheduledJobType } from '@/common/constants/ScheduledJobType.constant';

@Exclude()
export class ScheduledJobResponseDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  jobType: ScheduledJobType;

  @Expose()
  @Type(() => Date)
  executeAt: Date;

  @Expose()
  payload: Record<string, any>;
}

