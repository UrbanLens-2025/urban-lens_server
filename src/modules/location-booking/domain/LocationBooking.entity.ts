import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { WalletTransactionEntity } from '@/modules/wallet/domain/WalletTransaction.entity';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';
import { LocationBookingObject } from '@/common/constants/LocationBookingObject.constant';
import { LocationBookingDateEntity } from '@/modules/location-booking/domain/LocationBookingDate.entity';
import { ScheduledJobEntity } from '@/modules/scheduled-jobs/domain/ScheduledJob.entity';
import { isNotBlank } from '@/common/utils/is-not-blank.util';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { LocationBookingConfigEntity } from '@/modules/location-booking/domain/LocationBookingConfig.entity';
import { InternalServerErrorException } from '@nestjs/common';
import dayjs from 'dayjs';
import { Role } from '@/common/constants/Role.constant';

@Entity({ name: LocationBookingEntity.TABLE_NAME })
export class LocationBookingEntity {
  public static readonly TABLE_NAME = 'location_bookings';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'account_id' })
  createdBy: AccountEntity;

  @Column({ name: 'account_id', type: 'uuid' })
  createdById: string;

  @Column({
    name: 'booking_object',
    type: 'varchar',
    length: 100,
    default: LocationBookingObject.FOR_EVENT,
  })
  bookingObject: LocationBookingObject;

  @Column({
    name: 'target_id',
    type: 'uuid',
    nullable: true,
  })
  targetId?: string | null;

  @ManyToOne(() => LocationEntity, (location) => location.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @OneToMany(() => LocationBookingDateEntity, (date) => date.booking, {
    createForeignKeyConstraints: false,
    cascade: ['insert'],
    eager: true,
  })
  dates: LocationBookingDateEntity[];

  @Column({ name: 'status', type: 'varchar', length: 55 })
  status: LocationBookingStatus;

  @Column({ name: 'amount_to_pay', type: 'numeric' })
  amountToPay: number;

  @Column({
    name: 'soft_locked_until',
    type: 'timestamp with time zone',
    nullable: true,
  })
  softLockedUntil?: Date | null;

  @Column({ name: 'referenced_transaction_id', type: 'uuid', nullable: true })
  referencedTransactionId: string;

  @ManyToOne(
    () => WalletTransactionEntity,
    (walletTransaction) => walletTransaction.id,
    {
      createForeignKeyConstraints: false,
      nullable: true,
    },
  )
  @JoinColumn({ name: 'referenced_transaction_id' })
  referencedTransaction: WalletTransactionEntity;

  @Column({
    name: 'refund_transaction_id',
    type: 'uuid',
    nullable: true,
  })
  refundTransactionId?: string | null;

  @ManyToOne(
    () => WalletTransactionEntity,
    (walletTransaction) => walletTransaction.id,
    {
      createForeignKeyConstraints: false,
      nullable: true,
    },
  )
  @JoinColumn({ name: 'refund_transaction_id' })
  refundTransaction?: WalletTransactionEntity | null;

  @ManyToOne(() => ScheduledJobEntity, (scheduledJob) => scheduledJob.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'scheduled_payout_job_id' })
  scheduledPayoutJob?: ScheduledJobEntity | null;

  @Column({ name: 'scheduled_payout_job_id', type: 'bigint', nullable: true })
  scheduledPayoutJobId?: number | null;

  @Column({
    name: 'paid_out_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  paidOutAt?: Date | null;

  @Column({
    name: 'cancellation_reason',
    type: 'varchar',
    length: 555,
    nullable: true,
  })
  cancellationReason?: string | null;

  @Column({
    name: 'cancelled_by',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  cancelledBy?: Role.EVENT_CREATOR | Role.BUSINESS_OWNER | null;

  @Column({
    name: 'cancelled_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  cancelledAt?: Date | null;

  @Column({
    name: 'refunded_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  refundedAmount?: number | null;

  @Column({
    name: 'refunded_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  refundedAt?: Date | null;

  @Column({
    name: 'booking_config_snapshot',
    type: 'jsonb',
    nullable: true,
  })
  bookingConfigSnapshot?: LocationBookingConfigEntity | null;

  @Column({
    name: 'business_payout_transaction_id',
    type: 'uuid',
    nullable: true,
  })
  businessPayoutTransactionId?: string | null;

  @ManyToOne(
    () => WalletTransactionEntity,
    (walletTransaction) => walletTransaction.id,
    {
      createForeignKeyConstraints: false,
      nullable: true,
    },
  )
  @JoinColumn({ name: 'business_payout_transaction_id' })
  businessPayoutTransaction?: WalletTransactionEntity | null;

  @Column({
    name: 'system_payout_transaction_id',
    type: 'uuid',
    nullable: true,
  })
  systemPayoutTransactionId?: string | null;

  @ManyToOne(
    () => WalletTransactionEntity,
    (walletTransaction) => walletTransaction.id,
    {
      createForeignKeyConstraints: false,
      nullable: true,
    },
  )
  @JoinColumn({ name: 'system_payout_transaction_id' })
  systemPayoutTransaction?: WalletTransactionEntity | null;
  // domain functions

  getStartDate(): Date | null {
    if (!this.dates || this.dates.length === 0) {
      return null;
    }

    return this.dates.sort(
      (a, b) => a.startDateTime.getTime() - b.startDateTime.getTime(),
    )[0].startDateTime;
  }

  getEndDate(): Date | null {
    if (!this.dates || this.dates.length === 0) {
      return null;
    }

    return this.dates.sort(
      (a, b) => b.endDateTime.getTime() - a.endDateTime.getTime(),
    )[0].endDateTime;
  }

  public canBeProcessed(): boolean {
    return this.status === LocationBookingStatus.AWAITING_BUSINESS_PROCESSING;
  }

  /**
   * Checks if booking is in the right status.
   * Req: APPROVED and softLockedUntil is in the future (meaning it's not expired yet)
   * @returns true/false
   */
  public canStartPayment(): boolean {
    const now = new Date();
    return (
      this.status === LocationBookingStatus.APPROVED &&
      !!this.softLockedUntil &&
      now < this.softLockedUntil
    );
  }

  public canBePaidOut(): boolean {
    return (
      this.status === LocationBookingStatus.PAYMENT_RECEIVED &&
      !isNotBlank(this.paidOutAt)
    );
  }

  public canBeCancelled(): boolean {
    // check if booking is in a cancellable status
    const cancellableStatuses = [
      LocationBookingStatus.APPROVED,
      LocationBookingStatus.AWAITING_BUSINESS_PROCESSING,
    ];

    // check if booking date is in the past
    const bookingDates = this.dates; // don't worry, this is eagerly loaded!
    const now = new Date();
    const isPastBookingDate = bookingDates.some(
      (date) => date.startDateTime < now,
    );

    return cancellableStatuses.includes(this.status) && !isPastBookingDate;
  }

  public canBeForceCancelled(): boolean {
    const cancellableStatuses = [
      LocationBookingStatus.AWAITING_BUSINESS_PROCESSING,
      LocationBookingStatus.APPROVED,
    ];

    const bookingDates = this.dates;
    if (bookingDates === null || bookingDates === undefined) {
      throw new InternalServerErrorException('Booking dates are not loaded');
    }

    // cannot cancel bookings if the booking date has started already
    const now = dayjs();
    const bookingDateHasStarted = bookingDates.some((date) =>
      dayjs(date.startDateTime).isBefore(now),
    );

    return cancellableStatuses.includes(this.status) && !bookingDateHasStarted;
  }

  public isActive(): boolean {
    return (
      this.status === LocationBookingStatus.AWAITING_BUSINESS_PROCESSING ||
      this.status === LocationBookingStatus.APPROVED ||
      this.status === LocationBookingStatus.PAYMENT_RECEIVED
    );
  }

  /**
   * Location booking dates must contain the event booking times
   * @param dates
   * @param eventStartDate
   * @param eventEndDate
   */
  public static validateBookingTimes(
    dates: { startDateTime: Date; endDateTime: Date }[],
    eventStartDate?: Date | null,
    eventEndDate?: Date | null,
  ): boolean {
    if (!eventStartDate || !eventEndDate) {
      return true;
    }

    const earliestStartDate = dates.sort(
      (a, b) => a.startDateTime.getTime() - b.startDateTime.getTime(),
    )[0].startDateTime;

    const latestEndDate = dates.sort(
      (a, b) => b.endDateTime.getTime() - a.endDateTime.getTime(),
    )[0].endDateTime;

    return earliestStartDate <= eventStartDate && latestEndDate >= eventEndDate;
  }
}
