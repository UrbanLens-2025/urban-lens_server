import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { ProcessReport_NoActionTakenDto } from '@/common/dto/report/ProcessReport_NoActionTaken.dto';
import { ProcessReport_MaliciousReportDto } from '@/common/dto/report/ProcessReport_MaliciousReport.dto';
import { ProcessReport_BookingRefundDto } from '@/common/dto/report/ProcessReport_BookingRefund.dto';
import { ProcessReport_TicketRefundDto } from '@/common/dto/report/ProcessReport_TicketRefund.dto';
import { MarkReportsFirstSeenDto } from '@/common/dto/report/MarkReportsFirstSeen.dto';

export const IReportProcessingService = Symbol('IReportProcessingService');

export interface IReportProcessingService {
  markReportsFirstSeen(dto: MarkReportsFirstSeenDto): Promise<ReportResponseDto>;
  processReport_NoActionTaken(
    dto: ProcessReport_NoActionTakenDto,
  ): Promise<ReportResponseDto>;
  processReport_MaliciousReport(
    dto: ProcessReport_MaliciousReportDto,
  ): Promise<ReportResponseDto>;
  processReport_BookingRefund(
    dto: ProcessReport_BookingRefundDto,
  ): Promise<ReportResponseDto>;
  processReport_TicketRefund(
    dto: ProcessReport_TicketRefundDto,
  ): Promise<ReportResponseDto>;
}
