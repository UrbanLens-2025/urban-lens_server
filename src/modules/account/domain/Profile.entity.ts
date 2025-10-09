import { Rank } from '@/common/constants/Rank.constant';
import { AccountEntity } from '@/modules/auth/domain/Account.entity';
import { CheckInEntity } from '@/modules/business/domain/CheckIn.entity';
import {
  Entity,
  JoinColumn,
  Column,
  OneToOne,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'profiles' })
export class ProfileEntity {
  @PrimaryColumn({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @OneToOne(() => AccountEntity, (account) => account.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;

  @Column({ name: 'rank', type: 'enum', enum: Rank, default: Rank.BRONZE })
  rank: Rank;

  @Column({ name: 'points', type: 'integer', default: 0 })
  points: number;

  @Column({ name: 'total_achievements', type: 'integer', default: 0 })
  totalAchievements: number;

  @OneToMany(() => CheckInEntity, (checkIn) => checkIn.profile)
  checkIns: CheckInEntity[];
}
