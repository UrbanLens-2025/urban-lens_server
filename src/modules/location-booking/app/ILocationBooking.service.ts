import { CreateBookingForBusinessLocationDto } from '@/common/dto/location-booking/CreateBookingForBusinessLocation.dto';
import { LocationBookingResponseDto } from '@/common/dto/location-booking/res/LocationBooking.response.dto';

export const ILocationBookingService = Symbol('ILocationBookingService');
export interface ILocationBookingService {
  createBooking_ForBusinessLocation(
    dto: CreateBookingForBusinessLocationDto,
  ): Promise<LocationBookingResponseDto>;
}
