import { CoreService } from '@/common/core/Core.service';
import { GetLocationBookingConfigDto } from '@/common/dto/location-booking/GetLocationBookingConfig.dto';
import { LocationBookingConfigResponseDto } from '@/common/dto/location-booking/res/LocationBookingConfig.response.dto';
import { UpdateLocationBookingConfigDto } from '@/common/dto/location-booking/UpdateLocationBookingConfig.dto';
import { ILocationBookingConfigManagementService } from '@/modules/location-booking/app/ILocationBookingConfigManagement.service';
import { UpdateResult } from 'typeorm';
import { LocationBookingConfigRepository } from '@/modules/location-booking/infra/repository/LocationBookingConfig.repository';
import { LocationBookingConfigEntity } from '@/modules/location-booking/domain/LocationBookingConfig.entity';
import { Injectable } from '@nestjs/common';
import { CreateDefaultLocationBookingConfigDto } from '@/common/dto/location-booking/CreateDefaultLocationBookingConfig.dto';

@Injectable()
export class LocationBookingConfigManagementService
  extends CoreService
  implements ILocationBookingConfigManagementService
{
  async createDefaultLocationBookingConfig(
    dto: CreateDefaultLocationBookingConfigDto,
  ): Promise<void> {
    return this.ensureTransaction(dto.entityManager, async (manager) => {
      const locationBookingConfigRepository =
        LocationBookingConfigRepository(manager);

      const locationBookingConfig = LocationBookingConfigEntity.createDefault(
        dto.locationId,
        dto.businessId,
      );

      await locationBookingConfigRepository.save(locationBookingConfig);
    });
  }

  updateConfig(dto: UpdateLocationBookingConfigDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (manager) => {
      const locationBookingConfigRepository =
        LocationBookingConfigRepository(manager);

      const config = await locationBookingConfigRepository.findOneByOrFail({
        locationId: dto.locationId,
        createdById: dto.accountId,
      });

      const updatedConfig = this.assignTo_safe(config, dto);

      return locationBookingConfigRepository.update(
        { locationId: dto.locationId },
        updatedConfig,
      );
    });
  }

  getConfig(
    dto: GetLocationBookingConfigDto,
  ): Promise<LocationBookingConfigResponseDto> {
    const locationBookingConfigRepository = LocationBookingConfigRepository(
      this.dataSource,
    );

    return locationBookingConfigRepository
      .findOneByOrFail({
        locationId: dto.locationId,
      })
      .then((res) => this.mapTo(LocationBookingConfigResponseDto, res));
  }
}
