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
import { ItinerarySource } from '@/common/constants/ItinerarySource.constant';
import { ItineraryLocationEntity } from './ItineraryLocation.entity';

export interface AIMetadata {
  reasoning?: string;
  tips?: string[];
  prompt?: string;
  modelInfo?: string;
}

@Entity({ name: 'itinerary', schema: 'development' })
export class ItineraryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;

  @Column({
    name: 'source',
    type: 'varchar',
    length: 20,
    default: ItinerarySource.MANUAL,
  })
  source: ItinerarySource;

  @Column({ name: 'ai_metadata', type: 'jsonb', nullable: true })
  aiMetadata?: AIMetadata;

  @Column({
    name: 'album',
    type: 'text',
    array: true,
    default: [],
  })
  album: string[];

  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl?: string;

  @Column({
    name: 'location_wishlist',
    type: 'uuid',
    array: true,
    default: [],
  })
  locationWishlist: string[];

  @Column({ name: 'total_distance_km', type: 'double precision', default: 0 })
  totalDistanceKm: number;

  @Column({ name: 'total_travel_minutes', type: 'integer', default: 0 })
  totalTravelMinutes: number;

  @Column({ name: 'is_finished', type: 'boolean', default: false })
  isFinished: boolean;

  @Column({
    name: 'finished_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  finishedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => AccountEntity, { createForeignKeyConstraints: true })
  @JoinColumn({ name: 'user_id' })
  user: AccountEntity;

  @OneToMany(
    () => ItineraryLocationEntity,
    (itineraryLocation) => itineraryLocation.itinerary,
    { cascade: true, createForeignKeyConstraints: true },
  )
  locations: ItineraryLocationEntity[];
}
