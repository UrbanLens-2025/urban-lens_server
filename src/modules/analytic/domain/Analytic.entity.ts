import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('analytic')
export class AnalyticEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'analytic_id' })
  analyticId: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId: string;

  @Column({ name: 'entity_type', type: 'varchar', nullable: true })
  entityType: AnalyticEntityType;

  @Column({ name: 'total_upvotes', type: 'int', default: 0 })
  totalUpvotes: number;

  @Column({ name: 'total_downvotes', type: 'int', default: 0 })
  totalDownvotes: number;

  @Column({ name: 'total_comments', type: 'int', default: 0 })
  totalComments: number;

  @Column({ name: 'total_views', type: 'int', default: 0 })
  totalViews: number;

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
}

export enum AnalyticEntityType {
  POST = 'post',
  COMMENT = 'comment',
  LOCATION = 'location',
  EVENT = 'event',
}
