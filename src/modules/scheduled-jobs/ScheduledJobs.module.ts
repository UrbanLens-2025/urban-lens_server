import { Module } from '@nestjs/common';
import { ScheduledJobsInfraModule } from '@/modules/scheduled-jobs/infra/ScheduledJobs.infra.module';
import { IScheduledJobService } from '@/modules/scheduled-jobs/app/IScheduledJob.service';
import { ScheduledJobService } from '@/modules/scheduled-jobs/app/impl/ScheduledJob.service';
import { FetchScheduledJobsCronService } from '@/modules/scheduled-jobs/app/cron/FetchScheduledJobs.cron.service';
import { ScheduledJobsDevOnlyController } from '@/modules/scheduled-jobs/interfaces/ScheduledJobs.dev-only.interface';

@Module({
  imports: [
    ScheduledJobsInfraModule,
    // ClientsModule.registerAsync([
    //   {
    //     name: RabbitMQBaseClientConfig.SERVICE_NAME,
    //     useClass: RabbitMQBaseClientConfig,
    //     imports: [ConfigModule],
    //   },
    // ]),
  ],
  controllers: [ScheduledJobsDevOnlyController],
  providers: [
    {
      provide: IScheduledJobService,
      useClass: ScheduledJobService,
    },
    FetchScheduledJobsCronService,
  ],
  exports: [IScheduledJobService],
})
export class ScheduledJobsModule {}
