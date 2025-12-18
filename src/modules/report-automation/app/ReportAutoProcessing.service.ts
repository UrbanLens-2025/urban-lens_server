import { ReportResolutionActions } from '@/common/constants/ReportResolutionActions.constant';
import { ReportStatus } from '@/common/constants/ReportStatus.constant';
import { CoreService } from '@/common/core/Core.service';
import { ProcessReport_AutoCloseByPayoutDto } from '@/common/dto/report/ProcessReport_AutoCloseByPayout.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { IReportAutoProcessingService } from '@/modules/report-automation/app/IReportAutoProcessing.service';
import { ReportRepositoryProvider } from '@/modules/report/infra/repository/Report.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { In } from 'typeorm';

@Injectable()
export class ReportAutoProcessingService
  extends CoreService
  implements IReportAutoProcessingService
{
  processReport_AutoCloseByPayout(
    dto: ProcessReport_AutoCloseByPayoutDto,
  ): Promise<ReportResponseDto[]> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const reportRepo = ReportRepositoryProvider(em);

      const reports = await reportRepo.find({
        where: {
          targetId: In(dto.targetId),
          targetType: dto.targetType,
          status: ReportStatus.PENDING,
        },
      });

      if (reports.length !== dto.targetId.length) {
        const foundIds = reports.map((r) => r.id);
        const missingIds = dto.targetId.filter((id) => !foundIds.includes(id));
        throw new BadRequestException(
          `One or more reports not found or not accessible: ${missingIds.join(', ')}`,
        );
      }

      reports.map((report) => {
        report.status = ReportStatus.CLOSED;
        report.autoClosedByPayout = true;
        report.resolutionAction = ReportResolutionActions.NO_ACTION_TAKEN;
      });

      return reportRepo.save(reports).then((res) => res);
    }).then((res) => this.mapToArray(ReportResponseDto, res));
  }
}
