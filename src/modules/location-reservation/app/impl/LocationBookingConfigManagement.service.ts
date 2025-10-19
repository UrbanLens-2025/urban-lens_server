import { CoreService } from '@/common/core/Core.service';
import { AddLocationBookingConfigDto } from '@/common/dto/location-availability/AddLocationBookingConfig.dto';
import { GetLocationBookingConfigDto } from '@/common/dto/location-availability/GetLocationBookingConfig.dto';
import { LocationBookingConfigResponseDto } from '@/common/dto/location-availability/res/LocationBooking.response.dto';
import { UpdateLocationBookingConfigDto } from '@/common/dto/location-availability/UpdateLocationBookingConfig.dto';
import { ILocationBookingConfigManagementService } from '@/modules/location-reservation/app/ILocationBookingConfigManagement.service';
import { UpdateResult } from 'typeorm';
import { LocationBookingConfigRepository } from '@/modules/location-reservation/infra/repository/LocationBookingConfig.repository';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { LocationBookingConfigEntity } from '@/modules/location-reservation/domain/LocationBookingConfig.entity';
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

      const newConfig = this.mapTo_Raw(LocationBookingConfigEntity, dto);
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

      const updatedConfig = Object.assign(config, dto);

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
