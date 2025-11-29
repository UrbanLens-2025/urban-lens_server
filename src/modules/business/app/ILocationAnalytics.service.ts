import { GetTotalCheckInsDto } from '@/common/dto/business/GetTotalCheckIns.dto';
import { GetTotalCheckinsResponseDto } from '@/common/dto/location/analytics/GetTotalCheckins.response';

export const ILocationAnalyticsService = Symbol('ILocationAnalyticsService');

export interface ILocationAnalyticsService {
  getTotalCheckIns(
    dto: GetTotalCheckInsDto,
  ): Promise<GetTotalCheckinsResponseDto>;
}
