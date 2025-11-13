import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LocationEntity } from './Location.entity';

@Entity({ name: LocationAnalyticsEntity.TABLE_NAME })
export class LocationAnalyticsEntity {
  public static readonly TABLE_NAME = 'location_analytics';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => LocationEntity, (location) => location.analytics, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;

  @Column({ name: 'location_id', type: 'uuid', unique: true })
  locationId: string;

  @Column({ name: 'total_posts', type: 'bigint', default: 0 })
  totalPosts: number;

  @Column({ name: 'total_check_ins', type: 'bigint', default: 0 })
  totalCheckIns: number;

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews: number;

  @Column({
    name: 'average_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  averageRating: number;

  @Column({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
