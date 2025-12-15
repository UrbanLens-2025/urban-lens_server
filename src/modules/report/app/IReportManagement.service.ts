import { ProcessReportDto } from '@/common/dto/report/ProcessReport.dto';
import { ProcessReportV2Dto } from '@/common/dto/report/ProcessReportV2.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { deprecate } from 'util';

export const IReportManagementService = Symbol('IReportManagementService');

export interface IReportManagementService {
  /**
   * @deprecated
   * @param dto 
   */
  processReport(dto: ProcessReportDto): Promise<ReportResponseDto>;

  processReportV2(dto: ProcessReportV2Dto): Promise<ReportResponseDto>;
}
