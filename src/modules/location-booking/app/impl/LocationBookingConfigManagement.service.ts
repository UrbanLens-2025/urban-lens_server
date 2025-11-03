import { CoreService } from '@/common/core/Core.service';
import { AddLocationBookingConfigDto } from '@/common/dto/location-booking/AddLocationBookingConfig.dto';
import { GetLocationBookingConfigDto } from '@/common/dto/location-booking/GetLocationBookingConfig.dto';
import { LocationBookingConfigResponseDto } from '@/common/dto/location-booking/res/LocationBookingConfig.response.dto';
import { UpdateLocationBookingConfigDto } from '@/common/dto/location-booking/UpdateLocationBookingConfig.dto';
import { ILocationBookingConfigManagementService } from '@/modules/location-booking/app/ILocationBookingConfigManagement.service';
import { UpdateResult } from 'typeorm';
import { LocationBookingConfigRepository } from '@/modules/location-booking/infra/repository/LocationBookingConfig.repository';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { LocationBookingConfigEntity } from '@/modules/location-booking/domain/LocationBookingConfig.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocationBookingConfigManagementService
  extends CoreService
  implements ILocationBookingConfigManagementService
{
  addConfig(
    dto: AddLocationBookingConfigDto,
  ): Promise<LocationBookingConfigResponseDto> {
    return this.ensureTransaction(null, async (manager) => {
      const locationBookingConfigRepository =
        LocationBookingConfigRepository(manager);
      const locationRepository = LocationRepositoryProvider(manager);

      const location = await locationRepository.findOneByOrFail({
        id: dto.locationId,
        businessId: dto.accountId,
      });

      const newConfig = this.mapTo_safe(LocationBookingConfigEntity, dto);
      newConfig.createdById = dto.accountId;
      newConfig.location = location;

      return locationBookingConfigRepository
        .save(newConfig)
        .then((res) => this.mapTo(LocationBookingConfigResponseDto, res));
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
        createdById: dto.accountId,
      })
      .then((res) => this.mapTo(LocationBookingConfigResponseDto, res));
  }
}
