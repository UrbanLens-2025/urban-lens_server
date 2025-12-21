import { GetGeneralBusinessAnalyticsResponseDto } from '@/common/dto/business/analytics/GetGeneralBusinessAnalytics.response.dto';

export const IBusinessAnalyticsService = Symbol('IBusinessAnalyticsService');

export interface IBusinessAnalyticsService {
  getGeneralBusinessAnalytics(
    locationId: string,
  ): Promise<GetGeneralBusinessAnalyticsResponseDto>;
}
