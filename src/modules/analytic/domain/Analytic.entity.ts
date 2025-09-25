import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('analytic')
export class AnalyticEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'analytic_id' })
  analyticId: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ name: 'entity_type' })
  entityType: AnalyticEntityType;

  @Column({ name: 'total_likes', default: 0 })
  totalLikes: number;

  @Column({ name: 'total_dislikes', default: 0 })
  totalDislikes: number;

  @Column({ name: 'total_comments', default: 0 })
  totalComments: number;

  @Column({ name: 'total_views', default: 0 })
  totalViews: number;

  @Column({ name: 'avg_rating', default: 0 })
  avgRating: number;
}

export enum AnalyticEntityType {
  POST = 'post',
  COMMENT = 'comment',
}
