import { ILocationAnalyticsService } from '@/modules/business/app/ILocationAnalytics.service';
import { Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { GetTotalCheckInsDto } from '@/common/dto/business/GetTotalCheckIns.dto';
import { GetTotalCheckinsResponseDto } from '@/common/dto/location/analytics/GetTotalCheckins.response';
import { GetMyLocationRequestAnalyticsDto } from '@/common/dto/business/GetMyLocationRequestAnalytics.dto';
import { GetMyLocationRequestAnalyticsResponseDto } from '@/common/dto/business/analytics/GetMyLocationRequestAnalytics.response';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { LocationRequestRepository } from '@/modules/business/infra/repository/LocationRequest.repository';

@Injectable()
export class LocationAnalyticsService
  extends CoreService
  implements ILocationAnalyticsService
{
  getTotalCheckIns(
    dto: GetTotalCheckInsDto,
  ): Promise<GetTotalCheckinsResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const locationRepo = em.getRepository(LocationEntity);

      const location = await locationRepo.findOneByOrFail({
        id: dto.locationId,
      });

      return this.mapTo(GetTotalCheckinsResponseDto, {
        totalCheckIns: location.totalCheckIns,
      });
    });
  }

  getMyLocationRequestAnalytics(
    dto: GetMyLocationRequestAnalyticsDto,
  ): Promise<GetMyLocationRequestAnalyticsResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const locationRequestRepo = LocationRequestRepository(em);

      const statusCounts = await locationRequestRepo.getStatusCountsByAccountId({
        accountId: dto.accountId,
        startDate: dto.startDate,
        endDate: dto.endDate,
      });

      return this.mapTo(GetMyLocationRequestAnalyticsResponseDto, {
        statusCounts,
      });
    });
  }
}
