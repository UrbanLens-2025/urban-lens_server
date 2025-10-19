import { CoreService } from '@/common/core/Core.service';
import { UpdateLocationDto } from '@/common/dto/business/UpdateLocation.dto';
import { ILocationManagementService } from '@/modules/business/app/ILocationManagement.service';
import { Injectable } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { LocationEntity } from '@/modules/business/domain/Location.entity';

@Injectable()
export class LocationManagementService
  extends CoreService
  implements ILocationManagementService
{
  updateLocation(dto: UpdateLocationDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const locationRepository = LocationRepositoryProvider(em);
      await locationRepository.findOneOrFail({
        where: {
          id: dto.locationId,
          businessId: dto.accountId,
        },
      });

      const updatedLocation = this.mapTo_safe(LocationEntity, dto);
      return locationRepository.update({ id: dto.locationId }, updatedLocation);
    });
  }
}
