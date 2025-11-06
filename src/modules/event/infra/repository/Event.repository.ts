import { DataSource, EntityManager, Repository } from 'typeorm';
import { EventEntity } from '@/modules/event/domain/Event.entity';

export const EventRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(EventEntity).extend({
    findNearbyLocations(
      this: Repository<EventEntity>,
      payload: { latitude: number; longitude: number; radiusInMeters: number },
    ) {
      return this.createQueryBuilder('e')
        .leftJoinAndSelect('e.location', 'l')
        .addSelect(
          `
          ST_Distance(
            l.geom,
            ST_MakePoint(:lon, :lat)::geography
          )`,
          'distanceMeters',
        )
        .where(
          `
          ST_DWithin(
            l.geom,
            ST_MakePoint(:lon, :lat)::geography,
            :radius
          )`,
        )
        .setParameters({
          lat: payload.latitude,
          lon: payload.longitude,
          radius: payload.radiusInMeters,
        });
    },
  });

export type EventRepository = ReturnType<typeof EventRepository>;
