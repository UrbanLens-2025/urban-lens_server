import { Exclude, Expose, Type } from 'class-transformer';
import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';
import { EventRequestResponseDto } from '@/common/dto/event/res/EventRequest.response.dto';
import { LocationBookingObject } from '@/common/constants/LocationBookingObject.constant';
import { LocationBookingDateResponseDto } from '@/common/dto/location-booking/res/LocationBookingDate.response.dto';

@Exclude()
export class LocationBookingResponseDto {
  @Expose()
  id: string;

  @Expose()
  bookingObject: LocationBookingObject;

  @Expose()
  status: LocationBookingStatus;

  @Expose()
  amountToPay: number;

  @Expose()
  @Type(() => LocationBookingDateResponseDto)
  dates: LocationBookingDateResponseDto[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  createdById: string;

  @Expose()
  locationId: string;

  @Expose()
  referencedTransactionId: string;

  @Expose()
  softLockedUntil?: Date;

  // -- Relations --

  @Expose()
  @Type(() => AccountResponseDto)
  createdBy: AccountResponseDto;

  @Expose()
  @Type(() => LocationResponseDto)
  location: LocationResponseDto;

  @Expose()
  @Type(() => WalletTransactionResponseDto)
  referencedTransaction: WalletTransactionResponseDto;

  @Expose()
  @Type(() => EventRequestResponseDto)
  referencedEventRequest: EventRequestResponseDto;
}
