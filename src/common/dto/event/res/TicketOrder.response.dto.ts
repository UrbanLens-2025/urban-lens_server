import { Exclude, Expose, Type } from 'class-transformer';
import { EventTicketOrderStatus } from '@/common/constants/EventTicketOrderStatus.constant';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';
import { TicketOrderDetailsResponseDto } from '@/common/dto/event/res/TicketOrderDetails.response.dto';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { EventAttendanceResponseDto } from '@/common/dto/event/res/EventAttendance.response.dto';

@Exclude()
export class TicketOrderResponseDto {
  @Expose()
  id: string;

  @Expose()
  orderNumber: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  createdById: string;

  @Expose()
  totalPaymentAmount: number;

  @Expose()
  currency: SupportedCurrency;

  @Expose()
  status: EventTicketOrderStatus;

  @Expose()
  @Type(() => Date)
  refundedAt?: Date | null;

  @Expose()
  refundReason?: string | null;

  @Expose()
  referencedTransactionId: string | null;

  @Expose()
  eventId: string;

  // -- Relations --

  @Expose()
  @Type(() => AccountResponseDto)
  createdBy?: AccountResponseDto;

  @Expose()
  @Type(() => WalletTransactionResponseDto)
  referencedTransaction?: WalletTransactionResponseDto;

  @Expose()
  @Type(() => TicketOrderDetailsResponseDto)
  orderDetails?: TicketOrderDetailsResponseDto[];

  @Expose()
  @Type(() => EventResponseDto)
  event?: EventResponseDto;

  @Expose()
  @Type(() => EventAttendanceResponseDto)
  eventAttendances?: EventAttendanceResponseDto[];
}
