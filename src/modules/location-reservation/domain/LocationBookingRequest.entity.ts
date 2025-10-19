import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountEntity } from '@/modules/auth/domain/Account.entity';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { LocationBookingRequestStatus } from '@/common/constants/LocationBookingRequestStatus.constant';

@Entity('location_usage_request')
export class LocationBookingRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @ManyToOne(() => LocationEntity, (location) => location.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @ManyToOne(() => EventEntity, (event) => event.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  //

  @Column({ name: 'status', type: 'varchar', length: 50 })
  status: LocationBookingRequestStatus;

  //

  @Column({ name: 'start_date_time', type: 'timestamp with time zone' })
  startDateTime: Date;

  @Column({ name: 'end_date_time', type: 'timestamp with time zone' })
  endDateTime: Date;

  @Column({ name: 'note', type: 'text', nullable: true })
  note: string | null;
}
