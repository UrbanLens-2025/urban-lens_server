import { DataSource, EntityManager } from 'typeorm';
import { ProvinceEntity } from '@/modules/utility/domain/Province.entity';

export const ProvinceRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(ProvinceEntity).extend({});

export type ProvinceRepository = ReturnType<typeof ProvinceRepository>;
