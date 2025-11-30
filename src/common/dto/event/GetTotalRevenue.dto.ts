import { TimeBoundedAnalyticsDto } from '@/common/dto/TimeBoundedAnalytics.dto';

export class GetTotalRevenueDto extends TimeBoundedAnalyticsDto {
  eventId: string;
}
