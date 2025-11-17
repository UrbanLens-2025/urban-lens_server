import { ProcessReportDto } from '@/common/dto/report/ProcessReport.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';

export const IReportManagementService = Symbol('IReportManagementService');

export interface IReportManagementService {
  processReport(dto: ProcessReportDto): Promise<ReportResponseDto>;
}

