import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum RewardPointType {
  UPVOTE_DOWNVOTE = 'upvote_downvote',
  CREATE_COMMENT = 'create_comment',
  SHARE_BLOG = 'share_blog',
  CHECK_IN = 'check_in',
  CREATE_REVIEW = 'create_review',
  SHARE_ITINERARY = 'share_itinerary',
  CREATE_BLOG = 'create_blog',
}

@Entity({ name: 'reward_points' })
export class RewardPointEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'type', type: 'enum', enum: RewardPointType })
  type: RewardPointType;

  @Column({ name: 'points', type: 'int', nullable: false })
  points: number;
}
