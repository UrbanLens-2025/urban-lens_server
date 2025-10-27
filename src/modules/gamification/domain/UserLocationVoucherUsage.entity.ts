import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserLocationVoucherEntity } from './UserLocationVoucher.entity';
import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';

@Entity({ name: UserLocationVoucherUsageEntity.TABLE_NAME })
export class UserLocationVoucherUsageEntity {
  public static readonly TABLE_NAME = 'user_location_voucher_usages';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserLocationVoucherEntity, {
    createForeignKeyConstraints: false,
    nullable: false,
  })
  @JoinColumn({ name: 'user_location_voucher_id' })
  userLocationVoucher: UserLocationVoucherEntity;

  @Column({ name: 'user_location_voucher_id' })
  userLocationVoucherId: string;

  @ManyToOne(() => UserProfileEntity, {
    createForeignKeyConstraints: false,
    nullable: false,
  })
  @JoinColumn({ name: 'user_profile_id' })
  userProfile: UserProfileEntity;

  @Column({ name: 'user_profile_id' })
  userProfileId: string;

  @Column({ name: 'used_at', type: 'timestamp with time zone' })
  usedAt: Date;
}
