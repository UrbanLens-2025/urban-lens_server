import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportEntity } from '@/modules/report/domain/Report.entity';
import { ReportRepository } from '@/modules/report/infra/repository/Report.repository';
import { PenaltyEntity } from '@/modules/report/domain/Penalty.entity';
import { PenaltyRepository } from '@/modules/report/infra/repository/Penalty.repository';
import { ReportReasonEntity } from '@/modules/report/domain/ReportReason.entity';
import { ReportReasonRepository } from '@/modules/report/infra/repository/ReportReason.repository';
import { ReportReasonSeeder } from '@/modules/report/infra/seed/ReportReason.seeder';

const repositories = [
  ReportRepository,
  PenaltyRepository,
  ReportReasonRepository,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReportEntity,
      PenaltyEntity,
      ReportReasonEntity,
    ]),
  ],
  providers: [...repositories, ReportReasonSeeder],
  exports: repositories,
})
export class ReportInfraModule {}
