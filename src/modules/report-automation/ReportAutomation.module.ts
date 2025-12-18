import { IReportAutoProcessingService } from '@/modules/report-automation/app/IReportAutoProcessing.service';
import { ReportAutoProcessingService } from '@/modules/report-automation/app/ReportAutoProcessing.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: IReportAutoProcessingService,
      useClass: ReportAutoProcessingService,
    },
  ],
  exports: [IReportAutoProcessingService],
})
export class ReportAutomationModule {}
