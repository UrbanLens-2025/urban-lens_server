import { TimeBoundedAnalyticsDto } from '@/common/dto/TimeBoundedAnalytics.dto';

export class GetMyLocationRequestAnalyticsDto extends TimeBoundedAnalyticsDto {
  accountId: string;
}

