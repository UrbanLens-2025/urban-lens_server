import { CoreService } from '@/common/core/Core.service';
import { IReportProcessingService } from '@/modules/report/app/IReportProcessing.service';
import { Injectable } from '@nestjs/common';
import { ProcessReport_NoActionTakenDto } from '@/common/dto/report/ProcessReport_NoActionTaken.dto';
import { ProcessReport_MaliciousReportDto } from '@/common/dto/report/ProcessReport_MaliciousReport.dto';
import { ProcessReport_BookingRefundDto } from '@/common/dto/report/ProcessReport_BookingRefund.dto';
import { ProcessReport_TicketRefundDto } from '@/common/dto/report/ProcessReport_TicketRefund.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { ReportRepositoryProvider } from '@/modules/report/infra/repository/Report.repository';
import { In } from 'typeorm';
import { ReportStatus } from '@/common/constants/ReportStatus.constant';
import { ReportResolutionActions } from '@/common/constants/ReportResolutionActions.constant';

@Injectable()
export class ReportProcessingService
  extends CoreService
  implements IReportProcessingService
{
  constructor() {
    super();
  }

  processReport_NoActionTaken(
    dto: ProcessReport_NoActionTakenDto,
  ): Promise<ReportResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const reportRepo = ReportRepositoryProvider(em);
      const reports = await reportRepo.find({
        where: {
          id: In(dto.reportIds),
          status: ReportStatus.PENDING,
        },
      });

      reports.map((report) => {
        report.status = ReportStatus.CLOSED;
        report.resolutionAction = ReportResolutionActions.NO_ACTION_TAKEN;
        report.resolvedAt = new Date();
        report.resolvedById = dto.createdById;
      });

      return reportRepo.save(reports).then((res) => {
        return res;
      });
    }).then((res) => this.mapTo(ReportResponseDto, res));
  }

  processReport_MaliciousReport(
    dto: ProcessReport_MaliciousReportDto,
  ): Promise<ReportResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      // TODO: Implement
      await Promise.resolve();
      throw new Error('Not implemented');
    });
  }

  processReport_BookingRefund(
    dto: ProcessReport_BookingRefundDto,
  ): Promise<ReportResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      // TODO: Implement
      await Promise.resolve();
      throw new Error('Not implemented');
    });
  }

  processReport_TicketRefund(
    dto: ProcessReport_TicketRefundDto,
  ): Promise<ReportResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      // TODO: Implement
      await Promise.resolve();
      throw new Error('Not implemented');
    });
  }
}
