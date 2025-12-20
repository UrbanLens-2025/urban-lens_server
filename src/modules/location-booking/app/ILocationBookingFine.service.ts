import { CreateFineForBookingDto } from '@/common/dto/location-booking/CreateFineForBooking.dto';
import { GetFinesByBookingIdDto } from '@/common/dto/location-booking/GetFinesByBookingId.dto';
import { LocationBookingFineResponseDto } from '@/common/dto/location-booking/res/LocationBookingFine.response.dto';
import { UpdateFineDto } from '@/common/dto/location-booking/UpdateFine.dto';

export const ILocationBookingFineService = Symbol(
  'ILocationBookingFineService',
);

export interface ILocationBookingFineService {
  createFineForBooking(
    dto: CreateFineForBookingDto,
  ): Promise<LocationBookingFineResponseDto>;

  updateFine(dto: UpdateFineDto): Promise<LocationBookingFineResponseDto>;

  getFinesByBookingId(
    dto: GetFinesByBookingIdDto,
  ): Promise<LocationBookingFineResponseDto[]>;
}
