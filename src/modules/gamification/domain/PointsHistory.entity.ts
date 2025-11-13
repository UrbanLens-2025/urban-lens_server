import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PointsTransactionType {
  CHECK_IN = 'check_in',
  CREATE_BLOG = 'create_blog',
  CREATE_REVIEW = 'create_review',
  CREATE_COMMENT = 'create_comment',
  LOCATION_MISSION = 'location_mission',
  REDEEM = 'redeem',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
}

@Entity({ name: 'points_history' })
export class PointsHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'points', type: 'integer' })
  points: number;

  @Column({
    name: 'transaction_type',
    type: 'varchar',
    length: 50,
  })
  transactionType: PointsTransactionType;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string;

  @Column({ name: 'balance_before', type: 'integer' })
  balanceBefore: number;

  @Column({ name: 'balance_after', type: 'integer' })
  balanceAfter: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
