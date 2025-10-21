import { DataSource, EntityManager } from 'typeorm';
import { WardEntity } from '@/modules/utility/domain/Ward.entity';

export const WardRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(WardEntity).extend({});

export type WardRepository = ReturnType<typeof WardRepository>;
