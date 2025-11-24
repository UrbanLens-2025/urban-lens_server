import { BadRequestException, Injectable } from '@nestjs/common';
import { IReportManagementService } from '@/modules/report/app/IReportManagement.service';
import { ProcessReportDto } from '@/common/dto/report/ProcessReport.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { CoreService } from '@/common/core/Core.service';
import { ReportRepositoryProvider } from '@/modules/report/infra/repository/Report.repository';
import { ReportResolvedByType } from '@/common/constants/ReportResolvedByType.constant';
import { ReportResolutionActions } from '@/common/constants/ReportResolutionActions.constant';
import { ReportEntity } from '@/modules/report/domain/Report.entity';
import { ReportStatus } from '@/common/constants/ReportStatus.constant';

@Injectable()
export class ReportManagementService
  extends CoreService
  implements IReportManagementService
{
  processReport(dto: ProcessReportDto): Promise<ReportResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const reportRepo = ReportRepositoryProvider(em);
      const report = await reportRepo
        .findOneOrFail({
          where: { id: dto.reportId },
        })
        .then((res) => {
          if (!res.canBeProcessed()) {
            throw new BadRequestException(
              'Report must be pending to be processed',
            );
          }
          return res;
        });

      report.resolutionAction = dto.resolutionAction;
      report.resolvedByType = dto.initiatedByAccountId
        ? ReportResolvedByType.ADMIN
        : ReportResolvedByType.SYSTEM;
      report.resolvedAt = new Date();
      report.status = ReportStatus.CLOSED;

      if (report.resolvedByType === ReportResolvedByType.ADMIN) {
        report.resolvedById = dto.initiatedByAccountId;
      }

      this.handleReportResolution(report, dto.resolutionAction);

      return reportRepo
        .save(report)
        .then((res) => this.mapTo(ReportResponseDto, res));
    });
  }

  private handleReportResolution(
    report: ReportEntity,
    resolutionAction: ReportResolutionActions,
  ) {
    switch (resolutionAction) {
      case ReportResolutionActions.CANCEL_EVENT:
        break;
      case ReportResolutionActions.HIDE_EVENT:
        break;
      case ReportResolutionActions.NO_ACTION_TAKEN:
        break;
      case ReportResolutionActions.MALICIOUS_REPORT:
        break;
    }
  }
}
