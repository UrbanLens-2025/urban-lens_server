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
    nullable: true,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy?: AccountEntity | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdById?: string | null;

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

  @Column({ name: 'max_capacity', type: 'int', nullable: true })
  maxCapacity?: number | null;

  public static createDefault(
    locationId: string,
    createdById: string,
  ): LocationBookingConfigEntity {
    // note to self: instantiate a new entity object so the result has all needed helper functions. Don't just use {} as LocationBookingConfig
    const config = new LocationBookingConfigEntity();
    config.locationId = locationId;
    config.allowBooking = false; // default to false. user must explicitly set
    config.baseBookingPrice = 100000;
    config.currency = SupportedCurrency.VND;
    config.maxBookingDurationMinutes = 240;
    config.minBookingDurationMinutes = 60;
    config.minGapBetweenBookingsMinutes = 15;
    config.maxCapacity = null; // default to null (no limit)
    config.createdById = createdById;
    return config;
  }
}
