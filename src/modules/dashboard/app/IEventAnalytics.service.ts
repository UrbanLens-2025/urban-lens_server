import { GetGeneralEventAnalyticsResponseDto } from '@/common/dto/event/analytics/GetGeneralEventAnalytics.response.dto';

export const IEventAnalyticsService = Symbol('IEventAnalyticsService');

export interface IEventAnalyticsService {
  getGeneralEventAnalytics(
    eventId: string,
  ): Promise<GetGeneralEventAnalyticsResponseDto>;
}
