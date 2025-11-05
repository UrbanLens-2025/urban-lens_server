import { EventAttendanceEntity } from '@/modules/event/domain/EventAttendance.entity';
import { DataSource, EntityManager } from 'typeorm';

export const EventAttendanceRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(EventAttendanceEntity).extend({});

export type EventAttendanceRepository = ReturnType<
  typeof EventAttendanceRepository
>;
