import { HandleLocationBookingPayoutDto } from '@/common/dto/location-booking/HandleLocationBookingPayout.dto';
import { SchedulePayoutBookingDto } from '@/common/dto/location-booking/SchedulePayoutBooking.dto';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';

export const ILocationBookingPayoutService = Symbol(
  'ILocationBookingPayoutService',
);
export interface ILocationBookingPayoutService {
  schedulePayoutBooking(
    dto: SchedulePayoutBookingDto,
  ): Promise<LocationBookingEntity>;

  handlePayoutBooking(dto: HandleLocationBookingPayoutDto): Promise<unknown>;
}
