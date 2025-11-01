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
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { LocationBookingEntity } from '@/modules/location-reservation/domain/LocationBooking.entity';
import { EventRequestStatus } from '@/common/constants/EventRequestStatus.constant';
import { EventRequestTagsEntity } from '@/modules/event/domain/EventRequestTags.entity';
import { SocialLink } from '@/common/json/SocialLink.json';

@Entity({
  name: EventRequestEntity.TABLE_NAME,
})
export class EventRequestEntity {
  public static readonly TABLE_NAME = 'event_requests';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: AccountEntity;

  @Column({ name: 'created_by_id', type: 'uuid' })
  createdById: string;

  @Column({ name: 'event_name', type: 'varchar', length: 255 })
  eventName: string;

  @Column({ name: 'event_description', type: 'text' })
  eventDescription: string;

  @Column({ name: 'expected_number_of_participants', type: 'int' })
  expectedNumberOfParticipants: number;

  @Column({ name: 'allow_tickets', type: 'boolean' })
  allowTickets: boolean;

  @Column({ name: 'special_requirements', type: 'text' })
  specialRequirements: string;

  @Column({ name: 'status', type: 'varchar', length: 55 })
  status: EventRequestStatus;

  @ManyToOne(
    () => LocationBookingEntity,
    (locationBooking) => locationBooking.id,
    {
      createForeignKeyConstraints: false,
      nullable: true,
    },
  )
  @JoinColumn({ name: 'referenced_location_booking_id' })
  referencedLocationBooking: LocationBookingEntity;

  @Column({
    name: 'referenced_location_booking_id',
    type: 'uuid',
    nullable: true,
  })
  referencedLocationBookingId: string;

  @Column({ name: 'social', type: 'jsonb', nullable: true })
  social?: SocialLink | null;

  // reverse relations
  @OneToMany(
    () => EventRequestTagsEntity,
    (eventRequestTags) => eventRequestTags.eventRequest,
    { createForeignKeyConstraints: false },
  )
  eventRequestTags: EventRequestTagsEntity[];
}
