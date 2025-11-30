import { TimeBoundedAnalyticsDto } from '@/common/dto/TimeBoundedAnalytics.dto';

export class GetTicketsWithRevenueDto extends TimeBoundedAnalyticsDto {
  eventId: string;
}
