import { Exclude, Expose, Type } from 'class-transformer';
import { EventAttendanceStatus } from '@/common/constants/EventAttendanceStatus.constant';
import { TicketOrderResponseDto } from '@/common/dto/event/res/TicketOrder.response.dto';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { EventTicketResponseDto } from '@/common/dto/event/res/EventTicket.response.dto';

@Exclude()
export class EventAttendanceResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  orderId: string;

  @Expose()
  eventId: string;

  @Expose()
  status: EventAttendanceStatus;

  @Expose()
  ownerId: string | null;

  @Expose()
  ownerEmail: string | null;

  @Expose()
  ownerPhoneNumber: string | null;

  @Expose()
  referencedTicketOrderId: string;

  @Expose()
  ticketId: string;

  @Expose()
  numberOfAttendees: number;

  @Expose()
  @Type(() => Date)
  checkedInAt?: Date | null;

  // -- Relations --

  @Expose()
  @Type(() => TicketOrderResponseDto)
  order?: TicketOrderResponseDto;

  @Expose()
  @Type(() => EventResponseDto)
  event?: EventResponseDto;

  @Expose()
  @Type(() => AccountResponseDto)
  owner?: AccountResponseDto | null;

  @Expose()
  @Type(() => TicketOrderResponseDto)
  referencedTicketOrder?: TicketOrderResponseDto;

  @Expose()
  @Type(() => EventTicketResponseDto)
  ticket?: EventTicketResponseDto;
}
