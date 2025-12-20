import { ReportStatus } from '@/common/constants/ReportStatus.constant';
import { CoreService } from '@/common/core/Core.service';
import { GeneralReportAnalyticsResponseDto } from '@/common/dto/report/analytics/GeneralReportAnalyticsResponse.dto';
import { IReportAnalyticsService } from '@/modules/report/app/IReportAnalytics.service';
import { ReportEntityType } from '@/modules/report/domain/Report.entity';
import { ReportRepositoryProvider } from '@/modules/report/infra/repository/Report.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportAnalyticsService
  extends CoreService
  implements IReportAnalyticsService
{
  async getGeneralAnalytics(): Promise<GeneralReportAnalyticsResponseDto> {
    const reportRepository = ReportRepositoryProvider(this.dataSource);

    const totalReports = await reportRepository.count();
    const countPending = await reportRepository.count({
      where: {
        status: ReportStatus.PENDING,
      },
    });
    const countClosed = await reportRepository.count({
      where: {
        status: ReportStatus.CLOSED,
      },
    });
    const countTotalLocationReports = await reportRepository.count({
      where: {
        targetType: ReportEntityType.LOCATION,
      },
    });
    const countTotalEventReports = await reportRepository.count({
      where: {
        targetType: ReportEntityType.EVENT,
      },
    });
    const countTotalPostReports = await reportRepository.count({
      where: {
        targetType: ReportEntityType.POST,
      },
    });
    const countTotalBookingReports = await reportRepository.count({
      where: {
        targetType: ReportEntityType.BOOKING,
      },
    });

    return this.mapTo(GeneralReportAnalyticsResponseDto, {
      totalReports,
      countPending,
      countClosed,
      countTotalLocationReports,
      countTotalEventReports,
      countTotalPostReports,
      countTotalBookingReports,
    });
  }
}
