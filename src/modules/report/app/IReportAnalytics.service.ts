import { GeneralReportAnalyticsResponseDto } from '@/common/dto/report/analytics/GeneralReportAnalyticsResponse.dto';

export const IReportAnalyticsService = Symbol('IReportAnalyticsService');

export interface IReportAnalyticsService {
  getGeneralAnalytics(): Promise<GeneralReportAnalyticsResponseDto>;
}
