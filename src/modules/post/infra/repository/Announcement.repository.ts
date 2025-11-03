import { DataSource, EntityManager, Repository } from 'typeorm';
import { AnnouncementEntity } from '@/modules/post/domain/Announcement.entity';

export const AnnouncementRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(AnnouncementEntity).extend({
  });

export type AnnouncementRepository = ReturnType<typeof AnnouncementRepository>;
