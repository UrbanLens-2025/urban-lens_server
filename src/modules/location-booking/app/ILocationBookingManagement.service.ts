import { CreateBookingForBusinessLocationDto } from '@/common/dto/location-booking/CreateBookingForBusinessLocation.dto';
import { LocationBookingResponseDto } from '@/common/dto/location-booking/res/LocationBooking.response.dto';
import { ProcessBookingDto } from '@/common/dto/location-booking/ProcessBooking.dto';
import { UpdateResult } from 'typeorm';
import { PayForBookingDto } from '@/common/dto/location-booking/PayForBooking.dto';

export const ILocationBookingManagementService = Symbol(
  'ILocationBookingManagementService',
);
export interface ILocationBookingManagementService {
  createBooking_ForBusinessLocation(
    dto: CreateBookingForBusinessLocationDto,
  ): Promise<LocationBookingResponseDto>;

  processBooking(dto: ProcessBookingDto): Promise<UpdateResult>;

  payForBooking(dto: PayForBookingDto): Promise<LocationBookingResponseDto>;
}
