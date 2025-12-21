import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';
import { LocationBookingObject } from '@/common/constants/LocationBookingObject.constant';
import { LocationBookingDateResponseDto } from '@/common/dto/location-booking/res/LocationBookingDate.response.dto';
import { ScheduledJobResponseDto } from '@/common/dto/scheduled-job/res/ScheduledJob.response.dto';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { LocationBookingFineResponseDto } from '@/common/dto/location-booking/res/LocationBookingFine.response.dto';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';

@Exclude()
export class LocationBookingResponseDto {
  @Expose()
  id: string;

  @Expose()
  bookingObject: LocationBookingObject;

  @Expose()
  status: LocationBookingStatus;

  @Expose()
  @Type(() => Number)
  amountToPay: number;

  @Expose()
  refundedAmount?: number | null;

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
  targetId?: string | null;

  @Expose()
  referencedTransactionId?: string | null;

  @Expose()
  softLockedUntil?: Date | null;

  @Expose()
  scheduledPayoutJobId?: number | null;

  @Expose()
  @Type(() => Date)
  paidOutAt?: Date | null;

  @Expose()
  systemCutPercentage: number;

  @Expose()
  @Transform(({ obj }) => {
    const entity = obj as LocationBookingEntity;
    return LocationBookingEntity.calculateAmountToReceive(
      entity.amountToPay,
      entity.refundedAmount,
      entity.systemCutPercentage,
      entity.fines,
    );
  })
  amountToReceive: number;

  @Expose()
  businessPayoutTransactionId?: string | null;

  @Expose()
  systemPayoutTransactionId?: string | null;

  // -- Relations --

  @Expose()
  @Type(() => WalletTransactionResponseDto)
  businessPayoutTransaction?: WalletTransactionResponseDto | null;

  @Expose()
  @Type(() => WalletTransactionResponseDto)
  systemPayoutTransaction?: WalletTransactionResponseDto | null;

  @Expose()
  @Type(() => AccountResponseDto)
  createdBy: AccountResponseDto;

  @Expose()
  @Type(() => LocationResponseDto)
  location: LocationResponseDto;

  @Expose()
  @Type(() => WalletTransactionResponseDto)
  referencedTransaction?: WalletTransactionResponseDto;

  @Expose()
  @Type(() => ScheduledJobResponseDto)
  scheduledPayoutJob?: ScheduledJobResponseDto;

  @Expose()
  @Type(() => EventResponseDto)
  event?: EventResponseDto | null;

  @Expose()
  @Type(() => LocationBookingFineResponseDto)
  fines?: LocationBookingFineResponseDto[];
}
