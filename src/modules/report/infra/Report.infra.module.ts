import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from '@/modules/report/domain/Report.entity';
import { ReportRepository } from '@/modules/report/infra/repository/Report.repository';
import { ReportReasonEntity } from '@/modules/report/domain/ReportReason.entity';
import { ReportReasonRepository } from '@/modules/report/infra/repository/ReportReason.repository';
import { ReportReasonSeeder } from '@/modules/report/infra/seed/ReportReason.seeder';

const repositories = [ReportRepository, ReportReasonRepository];

@Module({
  imports: [TypeOrmModule.forFeature([ReportEntity, ReportReasonEntity])],
  providers: [...repositories, ReportReasonSeeder],
  exports: repositories,
})
export class ReportInfraModule {}
