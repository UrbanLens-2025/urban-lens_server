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

export enum LocationMissionMetric {
  ORDER_COUNT = 'order_count',
  LIKE_POSTS = 'like_posts',
  COMMENT_POSTS = 'comment_posts',
  JOIN_EVENTS = 'join_events',
  SHARE_POSTS = 'share_posts',
  FOLLOW_LOCATION = 'follow_location',
}

@Entity({ name: LocationMissionEntity.TABLE_NAME })
export class LocationMissionEntity {
  public static readonly TABLE_NAME = 'location_missions';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LocationEntity, {
    createForeignKeyConstraints: false,
    nullable: false,
  })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;

  @Column({ name: 'location_id' })
  locationId: string;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'metric', type: 'enum', enum: LocationMissionMetric })
  metric: LocationMissionMetric;

  @Column({ name: 'target' })
  target: number;

  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp with time zone' })
  endDate: Date;

  @Column({ name: 'reward' })
  reward: number;

  @Column({ name: 'image_urls', type: 'text', array: true, default: [] })
  imageUrls: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
