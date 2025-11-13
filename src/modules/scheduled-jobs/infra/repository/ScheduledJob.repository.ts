import { ScheduledJobStatus } from '@/common/constants/ScheduledJobStatus.constant';
import { ScheduledJobEntity } from '@/modules/scheduled-jobs/domain/ScheduledJob.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';

export const ScheduledJobRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(ScheduledJobEntity).extend({
    /**
     * Find all scheduled jobs where executeAt is in the past (executeAt <= now)
     */
    findDueJobs(this: Repository<ScheduledJobEntity>) {
      const now = new Date();
      return this.createQueryBuilder('scheduled_job')
        .where('scheduled_job.execute_at <= :now', { now })
        .andWhere('scheduled_job.status = :status', {
          status: ScheduledJobStatus.PENDING,
        })
        .orderBy('scheduled_job.execute_at', 'ASC')
        .getMany();
    },

    updateToProcessing(
      this: Repository<ScheduledJobEntity>,
      payload: {
        jobIds: number[];
      },
    ) {
      return this.update(payload.jobIds, {
        status: ScheduledJobStatus.PROCESSING,
      });
    },
  });

export type ScheduledJobRepository = ReturnType<typeof ScheduledJobRepository>;
