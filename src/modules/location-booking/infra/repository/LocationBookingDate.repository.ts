import { DataSource, EntityManager, Repository } from 'typeorm';
import { LocationBookingDateEntity } from '@/modules/location-booking/domain/LocationBookingDate.entity';
import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';

export const LocationBookingDateRepository = (
  ctx: DataSource | EntityManager,
) =>
  ctx.getRepository(LocationBookingDateEntity).extend({
    findBookedDatesByDateRange(
      this: Repository<LocationBookingDateEntity>,
      payload: {
        startDate: Date;
        endDate: Date;
      },
    ) {
      return this.createQueryBuilder('booking_date')
        .leftJoinAndSelect('booking_date.booking', 'booking')
        .where('booking.status = :status', {
          status: LocationBookingStatus.PAYMENT_RECEIVED,
        })
        .andWhere('booking_date.start_date_time <= :endDate', {
          endDate: payload.endDate,
        })
        .andWhere('booking_date.end_date_time >= :startDate', {
          startDate: payload.startDate,
        })
        .getMany();
    },
  });

export type LocationBookingDateRepository = ReturnType<
  typeof LocationBookingDateRepository
>;
