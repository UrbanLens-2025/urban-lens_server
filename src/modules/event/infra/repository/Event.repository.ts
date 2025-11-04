import { DataSource, EntityManager, Repository } from 'typeorm';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';

export const EventRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(EventEntity).extend({
    async findNearbyLocations(
      this: Repository<EventEntity>,
      payload: { latitude: number; longitude: number; radiusInMeters: number },
      config?: FindOneOptions<EventEntity>,
    ) {
      const qb = this.createQueryBuilder('e')
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
        })
        .orderBy('"distanceMeters"', 'ASC'); // for some reason, if I don't add "" here, it sees it as distancemeters????

      if (config?.where) {
        qb.andWhere(config.where);
      }

      // TODO standardize this relations handling
      if (config?.relations) {
        const relations = config.relations as unknown;
        if (typeof relations === 'string') {
          qb.leftJoinAndSelect(`l.${relations}`, relations);
        }

        if (Array.isArray(relations)) {
          relations.forEach((rel: string) => {
            qb.leftJoinAndSelect(`l.${rel}`, rel);
          });
        }
      }

      const { raw, entities } = await qb.getRawAndEntities();

      return entities.map((entity, i) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const row = raw[i];
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (entity as any).distanceMeters = Number(row.distanceMeters);
        return entity;
      });
    },
  });

export type EventRepository = ReturnType<typeof EventRepository>;
