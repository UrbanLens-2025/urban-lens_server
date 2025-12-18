import { LocationSuspensionType } from '@/common/constants/LocationSuspensionType.constant';
import { LocationSuspensionEntity } from '@/modules/business/domain/LocationSuspension.entity';
import { DataSource, EntityManager, MoreThan, Repository } from 'typeorm';

export const LocationSuspensionRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(LocationSuspensionEntity).extend({
    async getActiveBookingSuspension(
      this: Repository<LocationSuspensionEntity>,
      payload: { locationId: string },
    ) {
      return this.findOne({
        where: {
          locationId: payload.locationId,
          suspensionType: LocationSuspensionType.BOOKING,
          suspendedUntil: MoreThan(new Date()),
          isActive: true,
        },
        order: {
          suspendedUntil: 'DESC',
        },
      });
    },
    async getActiveLocationSuspension(
      this: Repository<LocationSuspensionEntity>,
      payload: { locationId: string },
    ) {
      return this.findOne({
        where: {
          locationId: payload.locationId,
          suspensionType: LocationSuspensionType.LOCATION,
          suspendedUntil: MoreThan(new Date()),
          isActive: true,
        },
        order: {
          suspendedUntil: 'DESC',
        },
      });
    },
  });

export type LocationSuspensionRepository = Repository<LocationSuspensionEntity>;
