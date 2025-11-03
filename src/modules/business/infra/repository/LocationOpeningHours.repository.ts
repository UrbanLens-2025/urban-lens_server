import { DataSource, EntityManager, Repository } from 'typeorm';
import { LocationOpeningHoursEntity } from '@/modules/business/domain/LocationOpeningHours.entity';
import { DayOfWeek } from '@/common/constants/DayOfWeek.constant';

export const LocationOpeningHoursRepository = (
  ctx: DataSource | EntityManager,
) =>
  ctx.getRepository(LocationOpeningHoursEntity).extend({
    findOverlapping(
      this: Repository<LocationOpeningHoursEntity>,
      payload: {
        locationId: string;
        startTime: string;
        endTime: string;
        dayOfWeek: DayOfWeek;
      },
    ) {
      const qb = this.createQueryBuilder('opening_hours')
        .where('opening_hours.location_id = :locationId', {
          locationId: payload.locationId,
        })
        .andWhere('opening_hours.day_of_week = :dayOfWeek', {
          dayOfWeek: payload.dayOfWeek,
        });

      // Check for overlapping time ranges
      // Two time ranges overlap if:
      // startTime1 <= endTime2 AND startTime2 <= endTime1
      qb.andWhere(
        '(opening_hours.start_time <= :endTime AND opening_hours.end_time >= :startTime)',
        {
          startTime: payload.startTime,
          endTime: payload.endTime,
        },
      );

      return qb.getMany();
    },
  });

export type LocationOpeningHoursRepository = ReturnType<
  typeof LocationOpeningHoursRepository
>;
