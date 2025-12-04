import { ScheduledJobStatus } from '@/common/constants/ScheduledJobStatus.constant';
import { ScheduledJobEntity } from '@/modules/scheduled-jobs/domain/ScheduledJob.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';

export const ScheduledJobRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(ScheduledJobEntity).extend({
    resetStaleJobs(this: Repository<ScheduledJobEntity>) {
      return this.update(
        {
          status: ScheduledJobStatus.PROCESSING,
        },
        {
          status: ScheduledJobStatus.PENDING,
        },
      );
    },
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

    updateToFailed(
      this: Repository<ScheduledJobEntity>,
      payload: {
        jobIds: number[];
      },
    ) {
      return this.update(payload.jobIds, {
        status: ScheduledJobStatus.FAILED,
        closedAt: new Date(),
      });
    },

    updateToCompleted(
      this: Repository<ScheduledJobEntity>,
      payload: {
        jobIds: number[];
      },
    ) {
      return this.update(payload.jobIds, {
        status: ScheduledJobStatus.COMPLETED,
        closedAt: new Date(),
      });
    },

    async getStatusCounts(
      this: Repository<ScheduledJobEntity>,
      payload: {
        startDate: Date;
        endDate: Date;
      },
    ): Promise<Array<{ status: ScheduledJobStatus; count: number }>> {
      const statusCounts = await this.createQueryBuilder('scheduled_job')
        .select('scheduled_job.status', 'status')
        .addSelect('COUNT(scheduled_job.id)', 'count')
        .where('scheduled_job.createdAt BETWEEN :startDate AND :endDate', {
          startDate: payload.startDate,
          endDate: payload.endDate,
        })
        .groupBy('scheduled_job.status')
        .getRawMany<{ status: ScheduledJobStatus; count: string }>();

      return statusCounts.map((item) => ({
        status: item.status,
        count: parseInt(item.count, 10),
      }));
    },
  });

export type ScheduledJobRepository = ReturnType<typeof ScheduledJobRepository>;
