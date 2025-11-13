import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduledJobEntity } from '@/modules/scheduled-jobs/domain/ScheduledJob.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduledJobEntity])],
})
export class ScheduledJobsInfraModule {}
