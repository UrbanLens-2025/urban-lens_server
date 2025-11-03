import { BadRequestException, Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { ILocationOpeningHoursManagementService } from '@/modules/business/app/ILocationOpeningHoursManagement.service';
import { LocationOpeningHoursRepository } from '@/modules/business/infra/repository/LocationOpeningHours.repository';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { CreateLocationOpeningHoursDto } from '@/common/dto/business/CreateLocationOpeningHours.dto';
import { UpdateLocationOpeningHoursDto } from '@/common/dto/business/UpdateLocationOpeningHours.dto';
import { DeleteLocationOpeningHoursDto } from '@/common/dto/business/DeleteLocationOpeningHours.dto';
import { GetLocationOpeningHoursDto } from '@/common/dto/business/GetLocationOpeningHours.dto';
import { LocationOpeningHoursEntity } from '@/modules/business/domain/LocationOpeningHours.entity';
import { LocationOpeningHoursResponseDto } from '@/common/dto/business/res/LocationOpeningHours.response.dto';
import { In, UpdateResult } from 'typeorm';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

@Injectable()
export class LocationOpeningHoursManagementService
  extends CoreService
  implements ILocationOpeningHoursManagementService
{
  getLocationOpeningHours(
    dto: GetLocationOpeningHoursDto,
  ): Promise<LocationOpeningHoursResponseDto[]> {
    const locationOpeningHoursRepository = LocationOpeningHoursRepository(
      this.dataSource,
    );

    return locationOpeningHoursRepository
      .find({
        where: {
          locationId: dto.locationId,
        },
        order: {
          dayOfWeek: 'ASC',
          startTime: 'ASC',
        },
      })
      .then((res) => this.mapToList(LocationOpeningHoursResponseDto, res));
  }

  deleteLocationOpeningHours(
    dto: DeleteLocationOpeningHoursDto,
  ): Promise<LocationOpeningHoursResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const locationOpeningHoursRepository = LocationOpeningHoursRepository(em);
      const locationRepository = LocationRepositoryProvider(em);

      const openingHours = await locationOpeningHoursRepository.findOneOrFail({
        where: {
          id: dto.openingHoursId,
          location: {
            businessId: dto.createdById,
          },
        },
        relations: {
          location: true,
        },
      });

      return locationOpeningHoursRepository
        .remove(openingHours)
        .then((e) => this.mapTo(LocationOpeningHoursResponseDto, e));
    });
  }

  updateLocationOpeningHours(
    dto: UpdateLocationOpeningHoursDto,
  ): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const locationOpeningHoursRepository = LocationOpeningHoursRepository(em);
      const locationRepository = LocationRepositoryProvider(em);

      const openingHours = await locationOpeningHoursRepository.findOneOrFail({
        where: {
          id: dto.openingHoursId,
          location: { businessId: dto.createdById },
        },
        relations: {
          location: true,
        },
      });

      // Prepare updated values
      const updatedStartTime = dto.startTime ?? openingHours.startTime;
      const updatedEndTime = dto.endTime ?? openingHours.endTime;

      // Validate time order if both are provided
      if (dto.startTime || dto.endTime) {
        const startTimeParsed = dayjs(updatedStartTime, 'HH:mm', true);
        const endTimeParsed = dayjs(updatedEndTime, 'HH:mm', true);

        if (!startTimeParsed.isValid() || !endTimeParsed.isValid()) {
          throw new BadRequestException('Invalid time format');
        }

        if (!startTimeParsed.isBefore(endTimeParsed)) {
          throw new BadRequestException('Start time must be before end time');
        }
      }

      // Check for overlapping opening hours on the same day
      const overlappingRanges =
        await locationOpeningHoursRepository.findOverlapping({
          locationId: openingHours.locationId,
          dayOfWeek: openingHours.dayOfWeek,
          startTime: updatedStartTime,
          endTime: updatedEndTime,
        });

      // Filter out the current record from overlaps
      const otherOverlappingRanges = overlappingRanges.filter(
        (r) => r.id !== openingHours.id,
      );

      let finalStartTime = updatedStartTime;
      let finalEndTime = updatedEndTime;

      if (otherOverlappingRanges.length > 0) {
        // Merge with overlapping ranges
        const allRanges = [openingHours, ...otherOverlappingRanges].map(
          (r) => ({
            startTime: r.startTime,
            endTime: r.endTime,
            startMinutes:
              dayjs(r.startTime, 'HH:mm', true).minute() +
              dayjs(r.startTime, 'HH:mm', true).hour() * 60,
            endMinutes:
              dayjs(r.endTime, 'HH:mm', true).minute() +
              dayjs(r.endTime, 'HH:mm', true).hour() * 60,
          }),
        );

        // Update with new times if provided
        if (dto.startTime) {
          const newStartMinutes =
            dayjs(updatedStartTime, 'HH:mm', true).minute() +
            dayjs(updatedStartTime, 'HH:mm', true).hour() * 60;
          allRanges[0].startTime = updatedStartTime;
          allRanges[0].startMinutes = newStartMinutes;
        }
        if (dto.endTime) {
          const newEndMinutes =
            dayjs(updatedEndTime, 'HH:mm', true).minute() +
            dayjs(updatedEndTime, 'HH:mm', true).hour() * 60;
          allRanges[0].endTime = updatedEndTime;
          allRanges[0].endMinutes = newEndMinutes;
        }

        const minStartMinutes = Math.min(
          ...allRanges.map((r) => r.startMinutes),
        );
        const maxEndMinutes = Math.max(...allRanges.map((r) => r.endMinutes));

        // Format back to HH:mm
        const minHours = Math.floor(minStartMinutes / 60);
        const minMins = minStartMinutes % 60;
        const maxHours = Math.floor(maxEndMinutes / 60);
        const maxMins = maxEndMinutes % 60;

        finalStartTime = `${String(minHours).padStart(2, '0')}:${String(minMins).padStart(2, '0')}`;
        finalEndTime = `${String(maxHours).padStart(2, '0')}:${String(maxMins).padStart(2, '0')}`;

        // Delete other overlapping ranges
        await locationOpeningHoursRepository.delete({
          id: In(otherOverlappingRanges.map((r) => r.id)),
        });
      }

      // Update the current record
      openingHours.startTime = finalStartTime;
      openingHours.endTime = finalEndTime;

      return locationOpeningHoursRepository.update(
        { id: dto.openingHoursId },
        {
          startTime: finalStartTime,
          endTime: finalEndTime,
        },
      );
    });
  }

  createLocationOpeningHours(
    dto: CreateLocationOpeningHoursDto,
  ): Promise<LocationOpeningHoursResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const locationOpeningHoursRepository = LocationOpeningHoursRepository(em);
      const locationRepository = LocationRepositoryProvider(em);

      // Verify location ownership
      const location = await locationRepository.findOneByOrFail({
        id: dto.locationId,
        businessId: dto.createdById,
      });

      // Check for overlapping opening hours on the same day
      const overlappingRanges =
        await locationOpeningHoursRepository.findOverlapping({
          locationId: dto.locationId,
          dayOfWeek: dto.dayOfWeek,
          startTime: dto.startTime,
          endTime: dto.endTime,
        });

      let finalStartTime = dto.startTime;
      let finalEndTime = dto.endTime;

      if (overlappingRanges.length > 0) {
        // Merge with overlapping ranges
        const allRanges = overlappingRanges.map((r) => ({
          startTime: r.startTime,
          endTime: r.endTime,
          startMinutes:
            dayjs(r.startTime, 'HH:mm', true).minute() +
            dayjs(r.startTime, 'HH:mm', true).hour() * 60,
          endMinutes:
            dayjs(r.endTime, 'HH:mm', true).minute() +
            dayjs(r.endTime, 'HH:mm', true).hour() * 60,
        }));

        const newStartMinutes =
          dayjs(dto.startTime, 'HH:mm', true).minute() +
          dayjs(dto.startTime, 'HH:mm', true).hour() * 60;
        const newEndMinutes =
          dayjs(dto.endTime, 'HH:mm', true).minute() +
          dayjs(dto.endTime, 'HH:mm', true).hour() * 60;

        allRanges.push({
          startTime: dto.startTime,
          endTime: dto.endTime,
          startMinutes: newStartMinutes,
          endMinutes: newEndMinutes,
        });

        const minStartMinutes = Math.min(
          ...allRanges.map((r) => r.startMinutes),
        );
        const maxEndMinutes = Math.max(...allRanges.map((r) => r.endMinutes));

        // Format back to HH:mm
        const minHours = Math.floor(minStartMinutes / 60);
        const minMins = minStartMinutes % 60;
        const maxHours = Math.floor(maxEndMinutes / 60);
        const maxMins = maxEndMinutes % 60;

        finalStartTime = `${String(minHours).padStart(2, '0')}:${String(minMins).padStart(2, '0')}`;
        finalEndTime = `${String(maxHours).padStart(2, '0')}:${String(maxMins).padStart(2, '0')}`;

        // Delete overlapping ranges
        await locationOpeningHoursRepository.delete({
          id: In(overlappingRanges.map((r) => r.id)),
        });
      }

      // Create new opening hours
      const openingHours = this.mapTo_Raw(LocationOpeningHoursEntity, {
        locationId: dto.locationId,
        dayOfWeek: dto.dayOfWeek,
        startTime: finalStartTime,
        endTime: finalEndTime,
      });
      openingHours.location = location;

      return locationOpeningHoursRepository
        .save(openingHours)
        .then((e) => this.mapTo(LocationOpeningHoursResponseDto, e));
    });
  }
}
