import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';

@Entity({ name: LocationBookingDateEntity.TABLE_NAME })
export class LocationBookingDateEntity {
  public static readonly TABLE_NAME = 'location_booking_dates';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => LocationBookingEntity, (booking) => booking.dates, {
    createForeignKeyConstraints: false,
    nullable: false,
  })
  @JoinColumn({ name: 'booking_id' })
  booking: LocationBookingEntity;

  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @Column({ name: 'start_date_time', type: 'timestamp with time zone' })
  startDateTime: Date;

  @Column({ name: 'end_date_time', type: 'timestamp with time zone' })
  endDateTime: Date;
}
