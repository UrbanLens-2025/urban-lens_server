import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: LocationBookingFineEntity.TABLE_NAME })
export class LocationBookingFineEntity {
  public static readonly TABLE_NAME = 'location_booking_fines';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdById: string;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: true,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: AccountEntity;

  @Column({ name: 'updated_by', type: 'uuid' })
  updatedById?: string | null;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: true,
    nullable: true,
  })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: AccountEntity | null;

  @ManyToOne(() => LocationBookingEntity, (booking) => booking.id, {
    createForeignKeyConstraints: true,
  })
  @JoinColumn({ name: 'booking_id' })
  booking: LocationBookingEntity;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ name: 'fine_amount', type: 'numeric' })
  fineAmount: number;

  @Column({ name: 'fine_reason', type: 'varchar' })
  fineReason: string;

  @Column({ name: 'paid_at', type: 'timestamp with time zone', nullable: true })
  paidAt?: Date | null;

  @Column({ name: 'paid_amount', type: 'numeric', default: 0 })
  paidAmount: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
