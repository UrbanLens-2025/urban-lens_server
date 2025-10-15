import { DataSource, EntityManager } from 'typeorm';
import { LocationAvailabilityEntity } from '@/modules/location-reservation/domain/LocationAvailability.entity';

export const LocationAvailabilityRepository = (
  ctx: DataSource | EntityManager,
) => ctx.getRepository(LocationAvailabilityEntity).extend({});

export type LocationAvailabilityRepository = ReturnType<
  typeof LocationAvailabilityRepository
>;
