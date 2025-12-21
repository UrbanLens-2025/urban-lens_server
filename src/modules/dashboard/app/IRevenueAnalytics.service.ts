import { GetBusinessRevenueAnalyticsResponseDto } from '@/common/dto/wallet/analytics/GetBusinessRevenueAnalytics.response.dto';
import { GetEventRevenueAnalyticsResponseDto } from '@/common/dto/wallet/analytics/GetEventRevenueAnalyticsResponse.dto';

export const IRevenueAnalyticsService = Symbol('IRevenueAnalyticsService');

export interface IRevenueAnalyticsService {
  getBusinessRevenueAnalytics(
    userId: string,
  ): Promise<GetBusinessRevenueAnalyticsResponseDto>;

  getEventRevenueAnalytics(
    userId: string,
  ): Promise<GetEventRevenueAnalyticsResponseDto>;
}
