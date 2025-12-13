import { CreateBookingForBusinessLocationDto } from '@/common/dto/location-booking/CreateBookingForBusinessLocation.dto';
import { LocationBookingResponseDto } from '@/common/dto/location-booking/res/LocationBooking.response.dto';
import { ProcessBookingDto } from '@/common/dto/location-booking/ProcessBooking.dto';
import { UpdateResult } from 'typeorm';
import { PayForBookingDto } from '@/common/dto/location-booking/PayForBooking.dto';
import { CancelBookingDto } from '@/common/dto/location-booking/CancelBooking.dto';
import { ProcessAndApproveBookingDto } from '@/common/dto/location-booking/ProcessAndApproveBooking.dto';
import { ProcessAndRejectBookingDto } from '@/common/dto/location-booking/ProcessAndRejectBooking.dto';
import { ForceCancelBookingDto } from '@/common/dto/location-booking/ForceCancelBooking.dto';
import { ForceRefundBookingDto } from '@/common/dto/location-booking/ForceRefundBooking.dto';

export const ILocationBookingManagementService = Symbol(
  'ILocationBookingManagementService',
);
export interface ILocationBookingManagementService {
  createBooking_ForBusinessLocation(
    dto: CreateBookingForBusinessLocationDto,
  ): Promise<LocationBookingResponseDto>;

  /**
   * @deprecated
   */
  processBooking(dto: ProcessBookingDto): Promise<UpdateResult>;

  /**
   * @deprecated
   * @param dto
   */
  payForBooking(dto: PayForBookingDto): Promise<LocationBookingResponseDto>;

  cancelBooking(dto: CancelBookingDto): Promise<LocationBookingResponseDto>;

  forceCancelBooking(
    dto: ForceCancelBookingDto,
  ): Promise<LocationBookingResponseDto>;

  processAndApproveBooking(
    dto: ProcessAndApproveBookingDto,
  ): Promise<LocationBookingResponseDto>;

  processAndRejectBooking(
    dto: ProcessAndRejectBookingDto,
  ): Promise<LocationBookingResponseDto[]>;

  forceRefundBooking(
    dto: ForceRefundBookingDto,
  ): Promise<LocationBookingResponseDto>;
}
