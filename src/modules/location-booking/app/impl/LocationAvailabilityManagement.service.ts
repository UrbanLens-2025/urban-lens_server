import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { ILocationAvailabilityManagementService } from '@/modules/location-booking/app/ILocationAvailabilityManagement.service';
import { LocationAvailabilityRepository } from '@/modules/location-booking/infra/repository/LocationAvailability.repository';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { AddLocationAvailabilityDto } from '@/common/dto/location-booking/AddLocationAvailability.dto';
import { LocationAvailabilityEntity } from '@/modules/location-booking/domain/LocationAvailability.entity';
import { LocationAvailabilityResponseDto } from '@/common/dto/location-booking/res/LocationAvailability.response.dto';
import { UpdateLocationAvailabilityDto } from '@/common/dto/location-booking/UpdateLocationAvailability.dto';
import { UpdateResult } from 'typeorm';
import { RemoveLocationAvailabilityDto } from '@/common/dto/location-booking/RemoveLocationAvailability.dto';
import { LocationAvailabilitySource } from '@/common/constants/LocationAvailabilitySource.constant';
import { GetLocationAvailabilityByMonthYearDto } from '@/common/dto/location-booking/GetLocationAvailabilityByMonthYear.dto';

@Injectable()
export class LocationAvailabilityManagementService
  extends CoreService
  implements ILocationAvailabilityManagementService
{
  getLocationAvailabilityByMonthYear(
    dto: GetLocationAvailabilityByMonthYearDto,
  ): Promise<LocationAvailabilityResponseDto[]> {
    const startDate = new Date(dto.year, dto.month - 2, 1);
    const endDate = new Date(dto.year, dto.month + 1, 1);

    const locationAvailabilityRepository = LocationAvailabilityRepository(
      this.dataSource,
    );

    return locationAvailabilityRepository
      .findAvailabilityInRange({
        locationId: dto.locationId,
        startDateTime: startDate,
        endDateTime: endDate,
      })
      .then((res) => this.mapToList(LocationAvailabilityResponseDto, res));
  }

  updateLocationAvailability(
    dto: UpdateLocationAvailabilityDto,
  ): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const locationAvailabilityRepository = LocationAvailabilityRepository(em);

      const locationAvailability = (
        await locationAvailabilityRepository.find({
          where: {
            id: dto.locationAvailabilityId,
            createdById: dto.createdById,
          },
          relations: {
            location: true,
          },
          take: 1,
        })
      )?.[0];

      if (!locationAvailability) {
        throw new NotFoundException('Location availability not found');
      }

      if (!locationAvailability.canBeUpdated()) {
        throw new BadRequestException(
          'You can only update future location availability records',
        );
      }

      if (dto.startDateTime && dto.endDateTime) {
        const existsOverlapping =
          await locationAvailabilityRepository.existsOverlappingAvailability(
            locationAvailability.locationId,
            dto.startDateTime,
            dto.endDateTime,
          );

        if (existsOverlapping) {
          throw new BadRequestException('Overlapping availability exists');
        }
      }

      const updated = this.mapTo_safe(LocationAvailabilityEntity, dto);

      return locationAvailabilityRepository.update(
        { id: dto.locationAvailabilityId },
        updated,
      );
    });
  }

  removeLocationAvailability(
    dto: RemoveLocationAvailabilityDto,
  ): Promise<LocationAvailabilityResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const locationAvailabilityRepository = LocationAvailabilityRepository(em);

      const locationAvailability =
        await locationAvailabilityRepository.findOneByOrFail({
          id: dto.locationAvailabilityId,
        });

      if (!locationAvailability.canBeRemoved()) {
        throw new BadRequestException(
          'You can only remove future location availability records',
        );
      }

      return locationAvailabilityRepository
        .remove(locationAvailability)
        .then((e) => this.mapTo(LocationAvailabilityResponseDto, e));
    });
  }

  addLocationAvailability(
    dto: AddLocationAvailabilityDto,
  ): Promise<LocationAvailabilityResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const locationAvailabilityRepository = LocationAvailabilityRepository(em);
      const locationRepository = LocationRepositoryProvider(em);

      const location = await locationRepository.findOneByOrFail({
        id: dto.locationId,
        businessId: dto.createdById,
      });

      const locationAvailability = this.mapTo_Raw(
        LocationAvailabilityEntity,
        dto,
      );

      locationAvailability.location = location;
      locationAvailability.source = LocationAvailabilitySource.MANUAL;

      const existsOverlapping =
        await locationAvailabilityRepository.existsOverlappingAvailability(
          dto.locationId,
          dto.startDateTime,
          dto.endDateTime,
        );

      if (existsOverlapping) {
        throw new BadRequestException('Overlapping availability exists');
      }

      return locationAvailabilityRepository
        .save(locationAvailability)
        .then((e) => this.mapTo(LocationAvailabilityResponseDto, e));
    });
  }
}
