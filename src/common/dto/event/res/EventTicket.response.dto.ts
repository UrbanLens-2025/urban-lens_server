import { Exclude, Expose, Type } from 'class-transformer';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';

@Exclude()
export class EventTicketResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  createdById: string;

  @Expose()
  @Type(() => AccountResponseDto)
  createdBy?: AccountResponseDto;

  @Expose()
  displayName: string;

  @Expose()
  description?: string;

  @Expose()
  price: number;

  @Expose()
  currency: string;

  @Expose()
  imageUrl?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  tos?: string;

  @Expose()
  totalQuantity: number;

  @Expose()
  totalQuantityAvailable: number;

  @Expose()
  quantityReserved: number;

  @Expose()
  @Type(() => Date)
  saleStartDate: Date;

  @Expose()
  @Type(() => Date)
  saleEndDate: Date;

  @Expose()
  minQuantityPerOrder: number;

  @Expose()
  maxQuantityPerOrder: number;

  @Expose()
  eventId: string;

  @Expose()
  @Type(() => EventResponseDto)
  event?: EventResponseDto;
}
