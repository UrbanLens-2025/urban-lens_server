import { CreateLocationAnalyticsDto } from '@/common/dto/business/CreateLocationAnalytics.dto';
import { LocationAnalyticsEntity } from '@/modules/business/domain/LocationAnalytics.entity';

export const ILocationAnalyticsService = Symbol('ILocationAnalyticsService');
export interface ILocationAnalyticsService {
  createLocationAnalyticsEntity(
    dto: CreateLocationAnalyticsDto,
  ): Promise<LocationAnalyticsEntity>;
}
