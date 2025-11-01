import { DataSource, EntityManager } from 'typeorm';
import { LocationBookingEntity } from '@/modules/location-reservation/domain/LocationBooking.entity';

export const LocationBookingRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(LocationBookingEntity).extend({});

export type LocationBookingRepository = ReturnType<
  typeof LocationBookingRepository
>;
