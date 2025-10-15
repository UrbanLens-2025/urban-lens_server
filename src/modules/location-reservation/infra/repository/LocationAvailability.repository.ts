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
        .andWhere('availability.start_time <= :endDateTime', { endDateTime })
        .andWhere('availability.end_time >= :startDateTime', { startDateTime })
        .getExists();
    },
  });

export type LocationAvailabilityRepository = ReturnType<
  typeof LocationAvailabilityRepository
>;
