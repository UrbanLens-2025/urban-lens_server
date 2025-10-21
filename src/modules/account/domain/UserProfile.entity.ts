import { AccountEntity } from '@/modules/auth/domain/Account.entity';
import { CheckInEntity } from '@/modules/business/domain/CheckIn.entity';
import { RankEntity } from '@/modules/gamification/domain/Rank.entity';
import {
  Entity,
  JoinColumn,
  Column,
  OneToOne,
  PrimaryColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity({ name: 'user_profiles' })
export class UserProfileEntity {
  @PrimaryColumn({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @OneToOne(() => AccountEntity, (account) => account.userProfile, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;

  @Column({ name: 'dob', type: 'timestamp with time zone', nullable: true })
  dob: Date;

  @ManyToOne(() => RankEntity, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'rank_id' })
  rank: RankEntity;

  @Column({ name: 'rank_id', type: 'uuid', nullable: true })
  rankId: string;

  @Column({ name: 'points', type: 'integer', default: 0 })
  points: number;

  @Column({ name: 'ranking_point', type: 'integer', default: 0 })
  rankingPoint: number;

  @Column({ name: 'total_achievements', type: 'integer', default: 0 })
  totalAchievements: number;

  @OneToMany(() => CheckInEntity, (checkIn) => checkIn.userProfile)
  checkIns: CheckInEntity[];
}
