import { CoreService } from '@/common/core/Core.service';
import { Environment } from '@/config/env.config';
import { RabbitMQBaseClientConfig } from '@/config/rabbitmq.config';
import { IScheduledJobService } from '@/modules/scheduled-jobs/app/IScheduledJob.service';
import { ScheduledJobRepository } from '@/modules/scheduled-jobs/infra/repository/ScheduledJob.repository';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { firstValueFrom } from 'rxjs';

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
    @Inject(IScheduledJobService)
    private readonly scheduledJobService: IScheduledJobService,
  ) {
    super();
  }

  onModuleInit() {
    try {
      const cronExpr = this.configService.getOrThrow<string>(
        'FETCH_SCHEDULED_JOBS_CRON_EXPRESSION',
      );

      this.logger.debug(
        'Fetch scheduled jobs with cron expression: ' + cronExpr,
      );

      const job = new CronJob(
        cronExpr,
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
    this.logger.debug('Fetching scheduled jobs');
    const scheduledJobRepository = ScheduledJobRepository(this.dataSource);
    try {
      const jobsToSchedule = await scheduledJobRepository.findDueJobs();
      const promises = jobsToSchedule.map((job) => this.scheduledJobService.processScheduledJob(job));
      Promise.allSettled(promises);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to fetch scheduled jobs: ${error.message}`,
          error.stack,
        );
      } else {
        throw error; // only throw unknown errors
      }
    }
  }
}
