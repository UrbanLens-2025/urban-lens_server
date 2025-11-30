import { TimeBoundedAnalyticsDto } from '@/common/dto/TimeBoundedAnalytics.dto';

export class GetTotalTicketsSoldDto extends TimeBoundedAnalyticsDto {
  eventId: string;
}
