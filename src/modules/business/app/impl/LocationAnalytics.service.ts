import { ILocationAnalyticsService } from '@/modules/business/app/ILocationAnalytics.service';
import { Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { GetTotalCheckInsDto } from '@/common/dto/business/GetTotalCheckIns.dto';
import { GetTotalCheckinsResponseDto } from '@/common/dto/location/analytics/GetTotalCheckins.response';
import { LocationEntity } from '@/modules/business/domain/Location.entity';

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
}
