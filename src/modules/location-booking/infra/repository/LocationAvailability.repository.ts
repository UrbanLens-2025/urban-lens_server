import { DataSource, EntityManager, Repository } from 'typeorm';
import { LocationAvailabilityEntity } from '@/modules/location-booking/domain/LocationAvailability.entity';
import { DayOfWeek } from '@/common/constants/DayOfWeek.constant';

export const LocationAvailabilityRepository = (
  ctx: DataSource | EntityManager,
) =>
  ctx.getRepository(LocationAvailabilityEntity).extend({
    findOverlapping(
      this: Repository<LocationAvailabilityEntity>,
      payload: {
        locationId: string;
        startTime: string;
        endTime: string;
        dayOfWeek: DayOfWeek;
      },
    ) {
      const qb = this.createQueryBuilder('availability')
        .where('availability.location_id = :locationId', {
          locationId: payload.locationId,
        })
        .andWhere('availability.day_of_week = :dayOfWeek', {
          dayOfWeek: payload.dayOfWeek,
        });

      // where start time is contained within an existing availability
      qb.andWhere(
        '(:startTime BETWEEN availability.start_time AND availability.end_time) OR (:endTime BETWEEN availability.start_time AND availability.end_time) OR (availability.start_time BETWEEN :startTime AND :endTime)',
        {
          startTime: payload.startTime,
          endTime: payload.endTime,
        },
      );

      return qb.getMany();
    },
    checkDateValidity(
      this: Repository<LocationAvailabilityEntity>,
      payload: { startDateTime: Date; endDateTime: Date },
    ) {},
  });

export type LocationAvailabilityRepository = ReturnType<
  typeof LocationAvailabilityRepository
>;
