import { DataSource, EntityManager, Repository } from 'typeorm';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { EventStatus } from '@/common/constants/EventStatus.constant';

export const EventRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(EventEntity).extend({
    findNearbyLocations(
      this: Repository<EventEntity>,
      payload: {
        latitude: number;
        longitude: number;
        radiusInMeters: number;
        status?: EventStatus;
      },
    ) {
      const qb = this.createQueryBuilder('e')
        .leftJoinAndSelect('e.location', 'l')
        .addSelect(
          `
          ST_Distance(
            l.geom::geography,
            ST_MakePoint(:lon, :lat)::geography
          )`,
          'distanceMeters',
        )
        .where(
          `
          ST_DWithin(
            l.geom::geography,
            ST_MakePoint(:lon, :lat)::geography,
            :radius
          )`,
        );

      if (payload.status) {
        qb.andWhere('e.status = :status', {
          status: payload.status,
        });
      }

      return qb.setParameters({
        lat: payload.latitude,
        lon: payload.longitude,
        radius: payload.radiusInMeters,
      });
    },
  });

export type EventRepository = ReturnType<typeof EventRepository>;
