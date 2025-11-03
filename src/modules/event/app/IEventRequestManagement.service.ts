import { CreateEventRequestWithBusinessLocationDto } from '@/common/dto/event/CreateEventRequestWithBusinessLocation.dto';
import { EventRequestResponseDto } from '@/common/dto/event/res/EventRequest.response.dto';
import { StartBookingPaymentDto } from '@/common/dto/location-booking/StartBookingPayment.dto';

export const IEventRequestManagementService = Symbol(
  'IEventRequestManagementService',
);
export interface IEventRequestManagementService {
  createEventRequest_WithBusinessLocation(
    dto: CreateEventRequestWithBusinessLocationDto,
  ): Promise<EventRequestResponseDto>;

  initiatePayment(
    dto: StartBookingPaymentDto,
  ): Promise<EventRequestResponseDto>;
}
