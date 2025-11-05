import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { EventTicketResponseDto } from '@/common/dto/event/res/EventTicket.response.dto';

@Exclude()
export class TicketOrderDetailsResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  quantity: number;

  @Expose()
  unitPrice: number;

  @Expose()
  currency: SupportedCurrency;

  @Expose()
  @Transform(({ value }) => Number(value))
  subTotal: number;

  @Expose()
  ticketId: string;

  @Expose()
  orderId: string;

  @Expose()
  ticketSnapshot: EventTicketResponseDto;

  // -- Relations --

  @Expose()
  @Type(() => EventTicketResponseDto)
  ticket?: EventTicketResponseDto;
}
