import { ScheduledJobType } from '@/common/constants/ScheduledJobType.constant';
import { CreateScheduledJobDto } from '@/common/dto/scheduled-job/CreateScheduledJob.dto';
import { ScheduledJobResponseDto } from '@/common/dto/scheduled-job/res/ScheduledJob.response.dto';
import { ScheduledJobEntity } from '@/modules/scheduled-jobs/domain/ScheduledJob.entity';

export const IScheduledJobService = Symbol('IScheduledJobService');
export interface IScheduledJobService {
  /**
   * Create a new scheduled job in the database
   * @param dto
   */
  createScheduledJob<T extends ScheduledJobType>(
    dto: CreateScheduledJobDto<T>,
  ): Promise<ScheduledJobResponseDto>;

  /**
   * Process a scheduled job by pushing it to the message queue for processing
   * @param scheduledJob
   */
  processScheduledJob(scheduledJob: ScheduledJobEntity): Promise<any[]>;
}
