import { LocationSuspensionType } from '@/common/constants/LocationSuspensionType.constant';
import { CoreService } from '@/common/core/Core.service';
import { GetAllSuspensionsDto } from '@/common/dto/business/GetAllSuspensions.dto';
import { LocationSuspensionResponseDto } from '@/common/dto/business/res/LocationSuspension.response.dto';
import { SuspendLocationBookingDto } from '@/common/dto/location-booking/SuspendLocationBooking.dto';
import { UpdateLocationSuspensionDto } from '@/common/dto/location-booking/UpdateLocationSuspension.dto';
import {
  LOCATION_SUSPENDED_EVENT,
  LocationSuspendedEvent,
} from '@/modules/business/domain/events/LocationSuspended.event';
import { LocationSuspensionEntity } from '@/modules/business/domain/LocationSuspension.entity';
import {
  ILocationSuspensionService,
  ILocationSuspensionService_QueryConfig,
} from '@/modules/business/app/ILocationSuspension.service';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { LocationSuspensionRepository } from '@/modules/business/infra/repository/LocationSuspension.repository';
import { LocationBookingConfigRepository } from '@/modules/location-booking/infra/repository/LocationBookingConfig.repository';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { paginate, Paginated } from 'nestjs-paginate';

@Injectable()
export class LocationSuspensionService
  extends CoreService
  implements ILocationSuspensionService
{
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  suspendLocationBooking(
    dto: SuspendLocationBookingDto,
  ): Promise<LocationSuspensionResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const locationRepo = LocationRepositoryProvider(em);
      const locationBookingConfigRepo = LocationBookingConfigRepository(em);
      const locationSuspensionRepo = LocationSuspensionRepository(em);

      const location = await locationRepo.findOneOrFail({
        where: {
          id: dto.locationId,
        },
        relations: {
          bookingConfig: true,
        },
      });

      await locationBookingConfigRepo.update(
        {
          locationId: location.id,
        },
        {
          allowBooking: false,
        },
      );

      const suspension = new LocationSuspensionEntity();
      suspension.locationId = location.id;
      suspension.suspensionType = LocationSuspensionType.BOOKING;
      suspension.suspensionReason = dto.suspensionReason;
      suspension.suspendedById = dto.accountId;
      suspension.suspendedUntil = dto.suspendedUntil;
      return await locationSuspensionRepo.save(suspension);
    })
      .then((res) => {
        this.eventEmitter.emit(
          LOCATION_SUSPENDED_EVENT,
          new LocationSuspendedEvent(res.locationId, res.id),
        );
        return res;
      })
      .then((res) => this.mapTo(LocationSuspensionResponseDto, res));
  }

  updateLocationSuspension(
    dto: UpdateLocationSuspensionDto,
  ): Promise<LocationSuspensionResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const locationSuspensionRepo = LocationSuspensionRepository(em);
      const locationSuspension = await locationSuspensionRepo.findOneOrFail({
        where: {
          id: dto.locationSuspensionId,
        },
      });

      const updatedSuspension = this.assignTo_safe(locationSuspension, dto);
      return locationSuspensionRepo.save(updatedSuspension);
    }).then((res) => this.mapTo(LocationSuspensionResponseDto, res));
  }

  getAllSuspensions(
    dto: GetAllSuspensionsDto,
  ): Promise<Paginated<LocationSuspensionResponseDto>> {
    return paginate(dto.query, LocationSuspensionRepository(this.dataSource), {
      ...ILocationSuspensionService_QueryConfig.getAllSuspensions(),
    }).then((res) => this.mapToPaginated(LocationSuspensionResponseDto, res));
  }
}
