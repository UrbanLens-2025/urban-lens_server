import { ProcessReport_AutoCloseByPayoutDto } from '@/common/dto/report/ProcessReport_AutoCloseByPayout.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';

export const IReportAutoProcessingService = Symbol(
  'IReportAutoProcessingService',
);

export interface IReportAutoProcessingService {
  processReport_AutoCloseByPayout(
    dto: ProcessReport_AutoCloseByPayoutDto,
  ): Promise<ReportResponseDto[]>;
}
