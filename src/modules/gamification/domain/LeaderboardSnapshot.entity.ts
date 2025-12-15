import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';

export enum LeaderboardPeriodType {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  SEASONAL = 'seasonal',
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter',
}

@Entity({ name: 'leaderboard_snapshots' })
@Index(['periodType', 'periodValue', 'rankPosition'])
@Index(['periodType', 'periodValue', 'userId'], { unique: true })
export class LeaderboardSnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'period_type',
    type: 'varchar',
    length: 20,
    enum: LeaderboardPeriodType,
  })
  periodType: LeaderboardPeriodType;

  @Column({ name: 'period_value', type: 'varchar', length: 50 })
  periodValue: string; // Format: '2025-11' for monthly, '2025' for yearly, '2025-spring' for seasonal

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => UserProfileEntity, {
    createForeignKeyConstraints: true,
  })
  @JoinColumn({ name: 'user_id' })
  userProfile: UserProfileEntity;

  @Column({ name: 'ranking_point', type: 'integer' })
  rankingPoint: number;

  @Column({ name: 'rank_position', type: 'integer' })
  rankPosition: number; // 1, 2, 3, ...

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
