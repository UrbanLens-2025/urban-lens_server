import { CoreService } from '@/common/core/Core.service';
import { CreateLocationAnalyticsDto } from '@/common/dto/business/CreateLocationAnalytics.dto';
import { ILocationAnalyticsService } from '@/modules/business/app/ILocationAnalytics.service';
import { LocationAnalyticsEntity } from '@/modules/business/domain/LocationAnalytics.entity';
import { LocationAnalyticsRepository } from '@/modules/business/infra/repository/LocationAnalytics.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocationAnalyticsService
  extends CoreService
  implements ILocationAnalyticsService
{
  createLocationAnalyticsEntity(
    dto: CreateLocationAnalyticsDto,
  ): Promise<LocationAnalyticsEntity> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const analyticsRepo = LocationAnalyticsRepository(em);
      return analyticsRepo.findOrCreateAnalytics({
        locationId: dto.locationId,
      });
    });
  }
}
