import { DataSource, EntityManager } from 'typeorm';
import { LocationBookingDateEntity } from '@/modules/location-booking/domain/LocationBookingDate.entity';

export const LocationBookingDateRepository = (
  ctx: DataSource | EntityManager,
) => ctx.getRepository(LocationBookingDateEntity).extend({});

export type LocationBookingDateRepository = ReturnType<
  typeof LocationBookingDateRepository
>;
