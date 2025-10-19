import { DataSource, EntityManager } from 'typeorm';
import { LocationRequestEntity } from '@/modules/business/domain/LocationRequest.entity';

export const LocationRequestRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(LocationRequestEntity).extend({});

export type LocationRequestRepository = ReturnType<
  typeof LocationRequestRepository
>;
