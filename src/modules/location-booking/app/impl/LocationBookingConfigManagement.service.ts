import { CoreService } from '@/common/core/Core.service';
import { GetLocationBookingConfigDto } from '@/common/dto/location-booking/GetLocationBookingConfig.dto';
import { LocationBookingConfigResponseDto } from '@/common/dto/location-booking/res/LocationBookingConfig.response.dto';
import { UpdateLocationBookingConfigDto } from '@/common/dto/location-booking/UpdateLocationBookingConfig.dto';
import { ILocationBookingConfigManagementService } from '@/modules/location-booking/app/ILocationBookingConfigManagement.service';
import { UpdateResult } from 'typeorm';
import { LocationBookingConfigRepository } from '@/modules/location-booking/infra/repository/LocationBookingConfig.repository';
import { LocationBookingConfigEntity } from '@/modules/location-booking/domain/LocationBookingConfig.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDefaultLocationBookingConfigDto } from '@/common/dto/location-booking/CreateDefaultLocationBookingConfig.dto';
import { LocationSuspensionRepository } from '@/modules/business/infra/repository/LocationSuspension.repository';
import dayjs from 'dayjs';

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
    return this.ensureTransaction(null, async (em) => {
      const locationBookingConfigRepository =
        LocationBookingConfigRepository(em);
      const locationSuspensionRepository = LocationSuspensionRepository(em);

      const config = await locationBookingConfigRepository.findOneOrFail({
        where: {
          locationId: dto.locationId,
          createdById: dto.accountId,
        },
      });

      const activeSuspension =
        await locationSuspensionRepository.getActiveBookingSuspension({
          locationId: dto.locationId,
        });
      if (activeSuspension) {
        throw new BadRequestException(
          `Booking is currently suspended until ${dayjs(activeSuspension.suspendedUntil).format('DD/MM/YYYY HH:mm')} for reason: ${activeSuspension.suspensionReason}`,
        );
      }

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
