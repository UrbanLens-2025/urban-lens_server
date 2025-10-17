import { Module } from '@nestjs/common';
import { ReportInfraModule } from './infra/Report.infra.module';
import { ReportService } from './app/impl/Report.service';
import { IReportService } from './app/IReport.service';
import { ReportController } from './interfaces/Report.controller';

@Module({
  imports: [ReportInfraModule],
  providers: [
    {
      provide: IReportService,
      useClass: ReportService,
    },
  ],
  controllers: [ReportController],
  exports: [IReportService],
})
export class ReportModule {}
