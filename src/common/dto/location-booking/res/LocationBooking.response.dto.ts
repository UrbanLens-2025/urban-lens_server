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
    // ! DUPLICATE CODE
    const typedObj = obj as LocationBookingResponseDto;
    const totalAmount = typedObj.amountToPay;
    const refundedAmount = typedObj.refundedAmount ?? 0;
    const totalFines = typedObj.fines
      ?.filter((fine) => fine.isActive === true && fine.paidAt === null)
      .reduce((sum, fine) => sum + Number(fine.fineAmount), 0);
    const systemCutPercentage = typedObj.systemCutPercentage;

    return (
      Number(totalAmount ?? 0) * (1 - Number(systemCutPercentage ?? 0)) -
      Number(refundedAmount ?? 0) -
      Number(totalFines ?? 0)
    );
  })
  amountToReceive: number;

  // -- Relations --

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
