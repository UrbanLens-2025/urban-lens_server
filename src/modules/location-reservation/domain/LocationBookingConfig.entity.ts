import {
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { AccountEntity } from '@/modules/account/domain/Account.entity';

@Entity({ name: LocationBookingConfigEntity.TABLE_NAME })
export class LocationBookingConfigEntity {
  public static readonly TABLE_NAME = 'location_booking_config';

  @PrimaryColumn({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @OneToOne(() => LocationEntity, (location) => location.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: AccountEntity;

  @Column({ name: 'created_by', type: 'uuid' })
  createdById: string;

  @Column({ name: 'allow_booking', type: 'boolean', default: false })
  allowBooking: boolean;

  @Column({
    name: 'base_booking_price',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  baseBookingPrice: number;

  @Column({ name: 'currency', type: 'varchar', length: 3 })
  currency: SupportedCurrency;

  @Column({ name: 'min_booking_duration_minutes', type: 'int' })
  minBookingDurationMinutes: number;

  @Column({ name: 'max_booking_duration_minutes', type: 'int' })
  maxBookingDurationMinutes: number;

  @Column({ name: 'min_gap_between_bookings_minutes', type: 'int' })
  minGapBetweenBookingsMinutes: number;
}
