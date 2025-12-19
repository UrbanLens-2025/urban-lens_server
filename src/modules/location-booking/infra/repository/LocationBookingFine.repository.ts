import { DataSource, EntityManager, IsNull, Repository } from 'typeorm';
import { LocationBookingFineEntity } from '@/modules/location-booking/domain/LocationBookingFine.entity';

export const LocationBookingFineRepository = (
  ctx: DataSource | EntityManager,
) =>
  ctx.getRepository(LocationBookingFineEntity).extend({
    async getAllActiveFinesForBooking(
      this: Repository<LocationBookingFineEntity>,
      payload: {
        bookingId: string;
      },
    ) {
      return this.find({
        where: {
          bookingId: payload.bookingId,
          isActive: true,
          paidAt: IsNull(),
        },
      });
    },
  });

export type LocationBookingFineRepository = ReturnType<
  typeof LocationBookingFineRepository
>;
