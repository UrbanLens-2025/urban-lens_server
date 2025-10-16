import { DataSource, EntityManager, Repository } from 'typeorm';
import { LocationAvailabilityEntity } from '@/modules/location-reservation/domain/LocationAvailability.entity';

export const LocationAvailabilityRepository = (
  ctx: DataSource | EntityManager,
) =>
  ctx.getRepository(LocationAvailabilityEntity).extend({
    existsOverlappingAvailability: function (
      this: Repository<LocationAvailabilityEntity>,
      locationId: string,
      startDateTime: Date,
      endDateTime: Date,
    ) {
      return this.createQueryBuilder('availability')
        .where('availability.location_id = :locationId', { locationId })
        .andWhere('availability.start_date_time <= :endDateTime', {
          endDateTime,
        })
        .andWhere('availability.end_date_time >= :startDateTime', {
          startDateTime,
        })
        .getExists();
    },

    containsAvailability: function (
      this: Repository<LocationAvailabilityEntity>,
      dto: { locationId: string; startDateTime: Date; endDateTime: Date },
    ) {
      // TODO recheck logic here
      return this.createQueryBuilder('availability')
        .where('availability.location_id = :locationId', {
          locationId: dto.locationId,
        })
        .andWhere('availability.start_date_time <= :startDateTime', {
          startDateTime: dto.startDateTime,
        })
        .andWhere('availability.end_date_time >= :endDateTime', {
          endDateTime: dto.endDateTime,
        })
        .getExists();
    },

    findAvailabilityInRange: function (
      this: Repository<LocationAvailabilityEntity>,
      dto: { locationId: string; startDateTime: Date; endDateTime: Date },
    ) {
      return this.createQueryBuilder('availability')
        .where('availability.location_id = :locationId', {
          locationId: dto.locationId,
        })
        .andWhere(
          'availability.start_date_time < :endDateTime AND availability.end_date_time > :startDateTime',
          {
            startDateTime: dto.startDateTime,
            endDateTime: dto.endDateTime,
          },
        )
        .getMany();
    },
  });

export type LocationAvailabilityRepository = ReturnType<
  typeof LocationAvailabilityRepository
>;
