import { ScheduledJobType } from '@/common/constants/ScheduledJobType.constant';
import { CreateScheduledJobDto } from '@/common/dto/scheduled-job/CreateScheduledJob.dto';
import { ScheduledJobResponseDto } from '@/common/dto/scheduled-job/res/ScheduledJob.response.dto';

export const IScheduledJobService = Symbol('IScheduledJobService');
export interface IScheduledJobService {
  /**
   * Create a new scheduled job in the database (used for long-running jobs: Jobs that run more than 1 day in the future)
   *
   * This method saves the job to the database, where a cron job will pick it up and execute it.
   * @param dto
   */
  createLongRunningScheduledJob<T extends ScheduledJobType>(
    dto: CreateScheduledJobDto<T>,
  ): Promise<ScheduledJobResponseDto>;

  /**
   * Create and immediately execute a short-running scheduled job (used for short-running jobs: Jobs that run within a few minutes or hours)
   *
   * This method pushes the job to a queue with delay.
   */
  createShortRunningScheduledJob(): Promise<void>;
}
