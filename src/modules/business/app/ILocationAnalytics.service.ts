import { GetTotalCheckInsDto } from '@/common/dto/business/GetTotalCheckIns.dto';
import { GetTotalCheckinsResponseDto } from '@/common/dto/location/analytics/GetTotalCheckins.response';
import { GetMyLocationRequestAnalyticsDto } from '@/common/dto/business/GetMyLocationRequestAnalytics.dto';
import { GetMyLocationRequestAnalyticsResponseDto } from '@/common/dto/business/analytics/GetMyLocationRequestAnalytics.response';

export const ILocationAnalyticsService = Symbol('ILocationAnalyticsService');

export interface ILocationAnalyticsService {
  getTotalCheckIns(
    dto: GetTotalCheckInsDto,
  ): Promise<GetTotalCheckinsResponseDto>;
  getMyLocationRequestAnalytics(
    dto: GetMyLocationRequestAnalyticsDto,
  ): Promise<GetMyLocationRequestAnalyticsResponseDto>;
}
