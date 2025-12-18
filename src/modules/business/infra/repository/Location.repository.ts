import { DataSource, EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { paginate, PaginateConfig, PaginateQuery } from 'nestjs-paginate';
import { LocationOwnershipType } from '@/common/constants/LocationType.constant';
import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';
import dayjs from 'dayjs';
import {
  DayOfWeek,
  numberToDayOfWeek,
} from '@/common/constants/DayOfWeek.constant';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';
import { LocationBookingDateEntity } from '@/modules/location-booking/domain/LocationBookingDate.entity';
import { LocationAvailabilityEntity } from '@/modules/location-booking/domain/LocationAvailability.entity';

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

    findBookableLocations(
      this: Repository<LocationEntity>,
      query: PaginateQuery,
      config: PaginateConfig<LocationEntity>,
      payload: {
        bookingDates?: {
          startDate: Date;
          endDate: Date;
        };
      },
    ) {
      const qb = this.createQueryBuilder('l');

      qb.innerJoin('l.bookingConfig', 'bc', 'bc.allowBooking = true');
      qb.where('l.ownershipType = :ownershipType', {
        ownershipType: LocationOwnershipType.OWNED_BY_BUSINESS,
      });

      if (payload.bookingDates) {
        const { startDate, endDate } = payload.bookingDates;

        // Calculate days of week needed
        const startDay = dayjs(startDate);
        const endDay = dayjs(endDate);
        const uniqueDays = new Set<DayOfWeek>();

        let current = startDay;
        while (!current.isAfter(endDay)) {
          uniqueDays.add(numberToDayOfWeek(current.day()));
          current = current.add(1, 'day');
        }

        // Check availability for all required days
        qb.andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select('1')
            .from(LocationAvailabilityEntity, 'la')
            .where('la.locationId = l.id')
            .andWhere('la.dayOfWeek IN (:...daysOfWeek)')
            .groupBy('la.locationId')
            .having('COUNT(DISTINCT la.dayOfWeek) = :expectedDayCount')
            .getQuery();
          return `EXISTS ${subQuery}`;
        });

        // Exclude locations with conflicting bookings
        qb.andWhere((qb) => {
          const subQuery = qb
            .subQuery()
            .select('1')
            .from(LocationBookingEntity, 'lb')
            .innerJoin(
              LocationBookingDateEntity,
              'lbd',
              'lbd.bookingId = lb.id',
            )
            .where('lb.locationId = l.id')
            .andWhere('lb.status IN (:...statuses)', {
              statuses: [
                LocationBookingStatus.APPROVED,
              ],
            })
            .andWhere('lbd.startDateTime <= :endDate')
            .andWhere('lbd.endDateTime >= :startDate')
            .getQuery();
          return `NOT EXISTS ${subQuery}`;
        });

        qb.setParameters({
          startDate,
          endDate,
          daysOfWeek: Array.from(uniqueDays),
          expectedDayCount: uniqueDays.size,
        });
      }

      return paginate(query, qb, {
        ...config,
        relations: {
          ...config.relations,
          bookings: true,
          bookingConfig: true,
        },
      });
    },
  });

export type LocationRepositoryProvider = ReturnType<
  typeof LocationRepositoryProvider
>;
