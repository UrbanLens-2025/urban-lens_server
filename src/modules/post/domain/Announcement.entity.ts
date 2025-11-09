import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { AnnouncementType } from '@/common/constants/AnnouncementType.constant';

@Entity({ name: 'announcements' })
export class AnnouncementEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: AccountEntity | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdById?: string | null;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: AccountEntity | null;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedById?: string | null;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  startDate: Date;

  @Column({
    name: 'end_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  endDate: Date | null;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({
    name: 'type',
    type: 'varchar',
    length: 50,
    default: AnnouncementType.LOCATION,
  })
  type: AnnouncementType;

  @ManyToOne(() => LocationEntity, (location) => location.id, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity | null;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId: string | null;

  @ManyToOne(() => EventEntity, (event) => event.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'event_id' })
  event?: EventEntity | null;

  @Column({ name: 'event_id', type: 'uuid', nullable: true })
  eventId?: string | null;

  @Column({ name: 'is_hidden', type: 'boolean', default: false })
  isHidden: boolean;
}
