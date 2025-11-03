import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { WalletTransactionEntity } from '@/modules/wallet/domain/WalletTransaction.entity';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';
import { EventRequestEntity } from '@/modules/event/domain/EventRequest.entity';
import { LocationBookingObject } from '@/common/constants/LocationBookingObject.constant';
import { LocationBookingDateEntity } from '@/modules/location-booking/domain/LocationBookingDate.entity';

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

  @Column({ name: 'referenced_transaction_id', type: 'uuid', nullable: true })
  referencedTransactionId: string;

  @Column({
    name: 'soft_locked_until',
    type: 'timestamp with time zone',
    nullable: true,
  })
  softLockedUntil?: Date | null;

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

  @OneToOne(
    () => EventRequestEntity,
    (eventRequest) => eventRequest.referencedLocationBooking,
    {
      createForeignKeyConstraints: false,
      nullable: true,
    },
  )
  referencedEventRequest?: EventRequestEntity | null;

  // domain functions

  public canBeProcessed(): boolean {
    return this.status === LocationBookingStatus.AWAITING_BUSINESS_PROCESSING;
  }

  public canStartPayment(): boolean {
    const now = new Date();
    return (
      this.status === LocationBookingStatus.APPROVED &&
      !!this.softLockedUntil &&
      now < this.softLockedUntil
    );
  }
}
