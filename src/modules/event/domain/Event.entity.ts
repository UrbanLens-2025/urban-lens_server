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
import { EventStatus } from '@/common/constants/EventStatus.constant';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { SocialLink } from '@/common/json/SocialLink.json';
import { EventTagsEntity } from '@/modules/event/domain/EventTags.entity';
import { EventTicketEntity } from '@/modules/event/domain/EventTicket.entity';
import { ScheduledJobEntity } from '@/modules/scheduled-jobs/domain/ScheduledJob.entity';
import { TicketOrderEntity } from '@/modules/event/domain/TicketOrder.entity';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';
import { EventValidationDocumentsJson } from '@/common/json/EventValidationDocuments.json';
import { InternalServerErrorException } from '@nestjs/common';

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
    createForeignKeyConstraints: true,
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
  avatarUrl?: string | null;

  @Column({ name: 'cover_url', type: 'varchar', length: 500, nullable: true })
  coverUrl?: string | null;

  @Column({
    name: 'expected_number_of_participants',
    type: 'int',
    default: 0,
  })
  expectedNumberOfParticipants: number;

  @Column({ name: 'allow_tickets', type: 'boolean', default: false })
  allowTickets: boolean;

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
    createForeignKeyConstraints: true,
    nullable: true,
  })
  @JoinColumn({ name: 'location_id' })
  location?: LocationEntity | null;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId?: string | null;

  @Column({ name: 'social', type: 'jsonb', nullable: true })
  social?: SocialLink[] | null;

  @Column({ name: 'event_validation_documents', type: 'jsonb', default: '[]' })
  eventValidationDocuments: EventValidationDocumentsJson[];

  @Column({ name: 'refund_policy', type: 'text', nullable: true })
  refundPolicy?: string | null;

  @Column({ name: 'terms_and_conditions', type: 'text', nullable: true })
  termsAndConditions?: string | null;

  @Column({
    name: 'cancellation_reason',
    type: 'varchar',
    length: 555,
    nullable: true,
  })
  cancellationReason?: string | null;

  @OneToMany(() => EventTagsEntity, (eventTags) => eventTags.event, {
    createForeignKeyConstraints: true,
  })
  tags: EventTagsEntity[];

  @Column({ name: 'has_paid_out', type: 'boolean', default: false })
  hasPaidOut: boolean;

  @Column({
    name: 'paid_out_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  paidOutAt?: Date | null;

  @ManyToOne(() => ScheduledJobEntity, (scheduledJob) => scheduledJob.id, {
    createForeignKeyConstraints: true,
    nullable: true,
  })
  @JoinColumn({ name: 'scheduled_job_id' })
  scheduledJob?: ScheduledJobEntity | null;

  @Column({ name: 'scheduled_job_id', type: 'int', nullable: true })
  scheduledJobId?: number | null;

  @OneToMany(() => EventTicketEntity, (eventTicket) => eventTicket.event, {
    createForeignKeyConstraints: true,
  })
  tickets: EventTicketEntity[];

  @OneToMany(() => TicketOrderEntity, (ticketOrder) => ticketOrder.event, {
    createForeignKeyConstraints: true,
  })
  ticketOrders: TicketOrderEntity[];

  // Analytics columns (migrated from analytic table)
  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews: number;

  @Column({
    name: 'avg_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  avgRating: number;

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
    // todo: remove this once we have a way to set the start and end dates
    const isStartDateInPast = (this.startDate && this.startDate < now) || true;
    const isEndDateInPast = (this.endDate && this.endDate < now) || true;
    return isCorrectStatus && isStartDateInPast && isEndDateInPast;
  }

  public canBePaidOut() {
    return this.status === EventStatus.FINISHED && !this.hasPaidOut;
  }

  public canBePublished() {
    const tickets = this.tickets;
    if (tickets === null || tickets === undefined) {
      throw new InternalServerErrorException('Event tickets are not loaded');
    }

    const correctStatus = this.status === EventStatus.DRAFT;
    const hasLocation = this.locationId !== null;
    const hasDisplayName = this.displayName !== null;
    const hasDates = this.startDate !== null && this.endDate !== null;
    const hasTickets = tickets.length > 0;
    return (
      correctStatus && hasLocation && hasDisplayName && hasDates && hasTickets
    );
  }

  public canBeUpdated() {
    const correctStatus =
      this.status === EventStatus.DRAFT ||
      this.status === EventStatus.PUBLISHED;
    return correctStatus;
  }

  public canSafelyModifyBooking() {
    return this.status === EventStatus.DRAFT;
  }

  public canBeCancelled() {
    const correctStatus =
      this.status === EventStatus.DRAFT ||
      this.status === EventStatus.PUBLISHED;
    return correctStatus;
  }
}
