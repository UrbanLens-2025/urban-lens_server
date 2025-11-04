import { Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { ILocationAvailabilityManagementService } from '@/modules/location-booking/app/ILocationAvailabilityManagement.service';
import { LocationAvailabilityRepository } from '@/modules/location-booking/infra/repository/LocationAvailability.repository';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { AddLocationAvailabilityDto } from '@/common/dto/location-booking/AddLocationAvailability.dto';
import { LocationAvailabilityEntity } from '@/modules/location-booking/domain/LocationAvailability.entity';
import { LocationAvailabilityResponseDto } from '@/common/dto/location-booking/res/LocationAvailability.response.dto';
import { In } from 'typeorm';
import { RemoveLocationAvailabilityDto } from '@/common/dto/location-booking/RemoveLocationAvailability.dto';
import { GetAvailabilityForLocationDto } from '@/common/dto/location-booking/GetAvailabilityForLocation.dto';
import { UpdateLocationAvailabilityDto } from '@/common/dto/location-booking/UpdateLocationAvailability.dto';

@Injectable()
export class LocationAvailabilityManagementService
  extends CoreService
  implements ILocationAvailabilityManagementService
{
  getAvailabilityForLocation(
    dto: GetAvailabilityForLocationDto,
  ): Promise<LocationAvailabilityResponseDto[]> {
    const locationAvailabilityRepository = LocationAvailabilityRepository(
      this.dataSource,
    );

    return locationAvailabilityRepository
      .find({
        where: {
          locationId: dto.locationId,
        },
      })
      .then((res) => this.mapToList(LocationAvailabilityResponseDto, res));
  }

  removeLocationAvailability(
    dto: RemoveLocationAvailabilityDto,
  ): Promise<LocationAvailabilityResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const locationAvailabilityRepository = LocationAvailabilityRepository(em);

      const locationAvailability =
        await locationAvailabilityRepository.findOneOrFail({
          where: {
            id: dto.locationAvailabilityId,
            location: {
              businessId: dto.createdById,
            },
          },
        });

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

      const locationAvailability = this.mapTo_safe(
        LocationAvailabilityEntity,
        dto,
      );
      locationAvailability.location = location;

      // check overlapping
      const overlappingRanges =
        await locationAvailabilityRepository.findOverlapping({
          endTime: dto.endTime,
          startTime: dto.startTime,
          locationId: dto.locationId,
          dayOfWeek: dto.dayOfWeek,
        });
      if (overlappingRanges.length > 0) {
        // merge overlapping ranges
        const earliestStartTime = overlappingRanges.reduce(
          (min, t) => (t.startTime < min ? t.startTime : min),
          '23:59',
        );
        const latestEndTime = overlappingRanges.reduce(
          (max, t) => (t.endTime > max ? t.endTime : max),
          '00:00',
        );

        locationAvailability.startTime =
          earliestStartTime < dto.startTime ? earliestStartTime : dto.startTime;
        locationAvailability.endTime =
          latestEndTime > dto.endTime ? latestEndTime : dto.endTime;

        // delete overlapping ranges
        await locationAvailabilityRepository.delete({
          id: In(overlappingRanges.map((r) => r.id)),
        });
      }

      return locationAvailabilityRepository
        .save(locationAvailability)
        .then((e) => this.mapTo(LocationAvailabilityResponseDto, e));
    });
  }

  updateLocationAvailability(
    dto: UpdateLocationAvailabilityDto,
  ): Promise<LocationAvailabilityResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const locationAvailabilityRepository = LocationAvailabilityRepository(em);

      const locationAvailability =
        await locationAvailabilityRepository.findOneOrFail({
          where: {
            id: dto.locationAvailabilityId,
            location: {
              businessId: dto.createdById,
            },
          },
          relations: {
            location: true,
          },
        });

      // Update startTime and endTime if provided
      if (dto.startTime !== undefined) {
        locationAvailability.startTime = dto.startTime;
      }
      if (dto.endTime !== undefined) {
        locationAvailability.endTime = dto.endTime;
      }

      const finalStartTime = locationAvailability.startTime;
      const finalEndTime = locationAvailability.endTime;

      // check overlapping (excluding the current record)
      const overlappingRanges =
        await locationAvailabilityRepository.findOverlapping({
          endTime: finalEndTime,
          startTime: finalStartTime,
          locationId: locationAvailability.locationId,
          dayOfWeek: locationAvailability.dayOfWeek,
        });

      // Filter out the current record from overlaps
      const otherOverlappingRanges = overlappingRanges.filter(
        (r) => r.id !== locationAvailability.id,
      );

      if (otherOverlappingRanges.length > 0) {
        // merge overlapping ranges
        const earliestStartTime = otherOverlappingRanges.reduce(
          (min, t) => (t.startTime < min ? t.startTime : min),
          '23:59',
        );
        const latestEndTime = otherOverlappingRanges.reduce(
          (max, t) => (t.endTime > max ? t.endTime : max),
          '00:00',
        );

        locationAvailability.startTime =
          earliestStartTime < finalStartTime
            ? earliestStartTime
            : finalStartTime;
        locationAvailability.endTime =
          latestEndTime > finalEndTime ? latestEndTime : finalEndTime;

        // delete overlapping ranges
        await locationAvailabilityRepository.delete({
          id: In(otherOverlappingRanges.map((r) => r.id)),
        });
      }

      return locationAvailabilityRepository
        .save(locationAvailability)
        .then((e) => this.mapTo(LocationAvailabilityResponseDto, e));
    });
  }
}
