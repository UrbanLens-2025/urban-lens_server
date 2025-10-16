import { DataSource, EntityManager } from 'typeorm';
import { CreatorProfileEntity } from '@/modules/account/domain/CreatorProfile.entity';

export const CreatorProfileRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(CreatorProfileEntity).extend({});

export type CreatorProfileRepository = ReturnType<
  typeof CreatorProfileRepository
>;
