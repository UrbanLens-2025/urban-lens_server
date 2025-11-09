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
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { EventStatus } from '@/common/constants/EventStatus.constant';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { SocialLink } from '@/common/json/SocialLink.json';
import { EventTagsEntity } from '@/modules/event/domain/EventTags.entity';
import { EventRequestEntity } from '@/modules/event/domain/EventRequest.entity';
import { EventTicketEntity } from '@/modules/event/domain/EventTicket.entity';

@Entity({ name: EventEntity.TABLE_NAME })
export class EventEntity {
  public static readonly TABLE_NAME = 'events';

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

  @Column({ name: 'display_name', type: 'varchar', length: 255 })
  displayName: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ name: 'cover_url', type: 'varchar', length: 500, nullable: true })
  coverUrl: string;

  @Column({ name: 'status', type: 'varchar', length: 50 })
  status: EventStatus;

  @Column({
    name: 'start_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  startDate?: Date | null;

  @Column({
    name: 'end_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  endDate?: Date | null;

  @ManyToOne(() => LocationEntity, (location) => location.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @Column({ name: 'social', type: 'jsonb', nullable: true })
  social?: SocialLink[] | null;

  @Column({ name: 'refund_policy', type: 'text', nullable: true })
  refundPolicy?: string | null;

  @Column({ name: 'terms_and_conditions', type: 'text', nullable: true })
  termsAndConditions?: string | null;

  @OneToMany(() => EventTagsEntity, (eventTags) => eventTags.event, {
    createForeignKeyConstraints: false,
  })
  tags: EventTagsEntity[];

  @OneToOne(() => EventRequestEntity, (eventRequest) => eventRequest.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'referenced_event_request_id' })
  referencedEventRequest: EventRequestEntity;

  @Column({ name: 'referenced_event_request_id', type: 'uuid' })
  referencedEventRequestId: string;

  @OneToMany(() => EventTicketEntity, (eventTicket) => eventTicket.event, {
    createForeignKeyConstraints: false,
  })
  tickets: EventTicketEntity[];

  //#region TRANSIENT FIELDS - Do NOT add @Column to these. These are NOT PERSISTED to the db.

  distanceMeters?: number;

  //#endregion

  public isPublished() {
    return this.status === EventStatus.PUBLISHED;
  }

  public canCheckIn(): boolean {
    return this.status === EventStatus.PUBLISHED;
  }

  public canBeFinished() {
    const isCorrectStatus = this.status === EventStatus.PUBLISHED;
    const now = new Date();
    const isStartDateInPast = this.startDate && this.startDate < now;
    const isEndDateInPast = this.endDate && this.endDate < now;
    return isCorrectStatus && isStartDateInPast && isEndDateInPast;
  }
}
