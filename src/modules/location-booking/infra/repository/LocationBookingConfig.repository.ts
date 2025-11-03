import { DataSource, EntityManager } from 'typeorm';
import { LocationBookingConfigEntity } from '@/modules/location-booking/domain/LocationBookingConfig.entity';

export const LocationBookingConfigRepository = (
  ctx: DataSource | EntityManager,
) => ctx.getRepository(LocationBookingConfigEntity).extend({});

export type LocationBookingConfigRepository = ReturnType<
  typeof LocationBookingConfigRepository
>;
