import { CoreService } from '@/common/core/Core.service';
import { Environment } from '@/config/env.config';
import { IScheduledJobService } from '@/modules/scheduled-jobs/app/IScheduledJob.service';
import { ScheduledJobRepository } from '@/modules/scheduled-jobs/infra/repository/ScheduledJob.repository';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ScheduledJobWrapperDto } from '@/common/dto/scheduled-job/ScheduledJobWrapper.dto';
import { ScheduledJobEntity } from '@/modules/scheduled-jobs/domain/ScheduledJob.entity';
import { ScheduledJobStatus } from '@/common/constants/ScheduledJobStatus.constant';

@Injectable()
export class FetchScheduledJobsCronService
  extends CoreService
  implements OnModuleInit
{
  private readonly logger = new Logger(FetchScheduledJobsCronService.name);
  private readonly CRON_JOB_NAME = 'fetch-scheduled-jobs';

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly configService: ConfigService<Environment>,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async onModuleInit() {
    try {
      // reset stale jobs in database
      await this.ensureTransaction(null, async (em) => {
        const scheduledJobRepository = ScheduledJobRepository(em);
        await scheduledJobRepository.resetStaleJobs();
      });

      const cronExpr = this.configService.getOrThrow<string>(
        'FETCH_SCHEDULED_JOBS_CRON_EXPRESSION',
      );

      this.logger.debug(
        'Fetch scheduled jobs initialized with cron expression: ' + cronExpr,
      );

      const job = new CronJob(
        cronExpr,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.handleFetchScheduledJobs.bind(this),
        null,
        true,
      );
      this.schedulerRegistry.addCronJob(this.CRON_JOB_NAME, job);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to initialize cron job: ${error.message}`,
          error.stack,
        );
      } else {
        throw error; // only throw unknown errors
      }
    }
  }

  private async handleFetchScheduledJobs() {
    const now = new Date();
    this.logger.debug(
      `Fetching scheduled jobs before ${now.toDateString()} at ${now.toTimeString()}`,
    );

    // Transaction 1: Only for fetching and updating job status
    const jobsToSchedule = await this.ensureTransaction(null, async (em) => {
      const scheduledJobRepository = ScheduledJobRepository(em);
      const jobs = await scheduledJobRepository.findDueJobs();

      if (jobs.length === 0) {
        return [];
      }

      this.logger.debug(
        'Found ' +
          jobs.length +
          ` jobs to schedule with ids: ${jobs.map((i) => i.id).join(', ')}`,
      );

      await scheduledJobRepository.updateToProcessing({
        jobIds: jobs.map((job) => job.id),
      });

      return jobs;
    });

    // Process jobs outside transaction (each listener creates its own transaction)
    if (jobsToSchedule.length > 0) {
      const promises = jobsToSchedule.map((job) =>
        this.eventEmitter.emitAsync(
          job.jobType,
          new ScheduledJobWrapperDto(job.id, job.payload),
        ),
      );
      const result = await Promise.allSettled(promises);

      const failedJobs: ScheduledJobEntity[] = [];
      result.forEach((j, index) => {
        const job = jobsToSchedule[index];
        if (j.status === 'rejected') {
          this.logger.error(
            `Failed to process scheduled job with id ${job.id}: ${j.reason}`,
          );

          failedJobs.push(job);
        }
      });

      // Transaction 2: Update failed jobs status
      if (failedJobs.length > 0) {
        await this.ensureTransaction(null, async (em) => {
          const scheduledJobRepository = ScheduledJobRepository(em);
          await scheduledJobRepository.update(
            failedJobs.map((job) => job.id),
            {
              status: ScheduledJobStatus.FAILED,
            },
          );
        });
      }
    }
  }
}
