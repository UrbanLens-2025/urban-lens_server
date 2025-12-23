import { DataSource, EntityManager, Repository } from 'typeorm';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';
import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';

export const LocationBookingRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(LocationBookingEntity).extend({
    findConflictingBookings(
      this: Repository<LocationBookingEntity>,
      payload: {
        startDate: Date;
        endDate: Date;
        locationId: string;
      },
    ) {
      return this.createQueryBuilder('booking')
        .leftJoinAndSelect('booking.dates', 'dates')
        .where('booking.locationId = :locationId', {
          locationId: payload.locationId,
        })
        .andWhere('booking.status IN (:...statuses)', {
          statuses: [
            LocationBookingStatus.APPROVED,
            LocationBookingStatus.AWAITING_BUSINESS_PROCESSING,
          ],
        })
        .andWhere('dates.startDateTime <= :endDate', {
          endDate: payload.endDate,
        })
        .andWhere('dates.endDateTime >= :startDate', {
          startDate: payload.startDate,
        })
        .getMany();
    },
  });

export type LocationBookingRepository = ReturnType<
  typeof LocationBookingRepository
>;
