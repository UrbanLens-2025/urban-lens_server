import { UpdateResult } from 'typeorm';
import { UpdateEventDto } from '@/common/dto/event/UpdateEvent.dto';
import { PublishEventDto } from '@/common/dto/event/PublishEvent.dto';
import { FinishEventDto } from '@/common/dto/event/FinishEvent.dto';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { CreateEventDto } from '@/common/dto/event/CreateEvent.dto';
import { InitiateEventBookingPaymentDto } from '@/common/dto/event/InitiateBookingPayment.dto';
import { AddLocationBookingDto } from '@/common/dto/event/AddLocationBooking.dto';
import { CancelEventBookingDto } from '@/common/dto/event/CancelEventBooking.dto';
import { CancelEventDto } from '@/common/dto/event/CancelEvent.dto';

export const IEventManagementService = Symbol('IEventManagementService');

export interface IEventManagementService {
  createEvent(dto: CreateEventDto): Promise<EventResponseDto>;
  updateMyEvent(dto: UpdateEventDto): Promise<UpdateResult>;
  publishEvent(dto: PublishEventDto): Promise<UpdateResult>;
  cancelEvent(dto: CancelEventDto): Promise<EventResponseDto>;

  /**
   * This method should finish the specified event and start a 1 week countdown until event ticket sales are transferred to the event owners wallet
   * @param dto
   */
  finishEvent(dto: FinishEventDto): Promise<EventResponseDto>;
  initiateBookingPayment(
    dto: InitiateEventBookingPaymentDto,
  ): Promise<EventResponseDto>;
  addLocationBooking(dto: AddLocationBookingDto): Promise<EventResponseDto>;

  cancelEventBooking(dto: CancelEventBookingDto): Promise<EventResponseDto>;
}
