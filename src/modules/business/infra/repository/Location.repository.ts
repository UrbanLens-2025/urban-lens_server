import { DataSource, EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { LocationEntity } from '@/modules/business/domain/Location.entity';

@Injectable()
export class LocationRepository {
  constructor(
    @InjectRepository(LocationEntity)
    public readonly repo: Repository<LocationEntity>,
  ) {}
}

export const LocationRepositoryProvider = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(LocationEntity).extend({
    findNearbyLocations(
      this: Repository<LocationEntity>,
      payload: {
        latitude: number;
        longitude: number;
        radiusInMeters: number;
        isVisible?: boolean;
      },
    ) {
      const qb = this.createQueryBuilder('l')
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

      if (payload.isVisible !== undefined && payload.isVisible !== null) {
        qb.andWhere('l.isVisibleOnMap = :isVisible', {
          isVisible: payload.isVisible,
        });
      }

      return qb.setParameters({
        lat: payload.latitude,
        lon: payload.longitude,
        radius: payload.radiusInMeters,
      });
    },

    calculateDistanceTo(
      this: Repository<LocationEntity>,
      payload: {
        locationId: string;
        dest: {
          latitude: number;
          longitude: number;
        };
      },
    ) {
      return this.createQueryBuilder('l')
        .addSelect(
          'ST_Distance(geom, ST_MakePoint(:lon, :lat)::geography) AS "distanceMeters"',
        )
        .where('l.id = :locationId', { locationId: payload.locationId })
        .setParameters({
          lat: payload.dest.latitude,
          lon: payload.dest.longitude,
        })
        .getRawOne<{ distanceMeters: string | number }>()
        .then((row) => {
          return row !== undefined ? Number(row.distanceMeters) : undefined;
        });
    },
  });

export type LocationRepositoryProvider = ReturnType<
  typeof LocationRepositoryProvider
>;
