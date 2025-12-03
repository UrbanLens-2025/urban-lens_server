import { Module } from '@nestjs/common';
import { ScheduledJobsInfraModule } from '@/modules/scheduled-jobs/infra/ScheduledJobs.infra.module';
import { IScheduledJobService } from '@/modules/scheduled-jobs/app/IScheduledJob.service';
import { ScheduledJobService } from '@/modules/scheduled-jobs/app/impl/ScheduledJob.service';
import { FetchScheduledJobsCronService } from '@/modules/scheduled-jobs/app/cron/FetchScheduledJobs.cron.service';
import { ScheduledJobsDevOnlyController } from '@/modules/scheduled-jobs/interfaces/ScheduledJobs.dev-only.interface';
import { ScheduledJobsAdminController } from '@/modules/scheduled-jobs/interfaces/ScheduledJobs.admin.controller';
import { IScheduledJobManagementService } from '@/modules/scheduled-jobs/app/IScheduledJob.management.service';
import { ScheduledJobManagementService } from '@/modules/scheduled-jobs/app/impl/ScheduledJob.management.service';

@Module({
  imports: [ScheduledJobsInfraModule],
  controllers: [ScheduledJobsDevOnlyController, ScheduledJobsAdminController],
  providers: [
    {
      provide: IScheduledJobService,
      useClass: ScheduledJobService,
    },
    {
      provide: IScheduledJobManagementService,
      useClass: ScheduledJobManagementService,
    },
    FetchScheduledJobsCronService,
  ],
  exports: [IScheduledJobService],
})
export class ScheduledJobsModule {}
