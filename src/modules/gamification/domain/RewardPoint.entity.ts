import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

export enum RewardPointType {
  CREATE_COMMENT = 'create_comment',
  SHARE_BLOG = 'share_blog',
  CHECK_IN = 'check_in',
  CREATE_REVIEW = 'create_review',
  SHARE_ITINERARY = 'share_itinerary',
  CREATE_BLOG = 'create_blog',
}

@Entity({ name: 'reward_points' })
@Unique(['type'])
export class RewardPointEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'type', type: 'varchar', length: 50 })
  type: RewardPointType;

  @Column({ name: 'points', type: 'int', nullable: false })
  points: number;
}
