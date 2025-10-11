import { DataSource, EntityManager } from 'typeorm';
import { PublicFileEntity } from '@/modules/file-storage/domain/PublicFile.entity';

export const PublicFileRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(PublicFileEntity).extend({});

export type PublicFileRepository = ReturnType<typeof PublicFileRepository>;
