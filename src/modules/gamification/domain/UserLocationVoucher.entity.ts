import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { LocationVoucherEntity } from './LocationVoucher.entity';

@Entity({ name: UserLocationVoucherEntity.TABLE_NAME })
export class UserLocationVoucherEntity {
  public static readonly TABLE_NAME = 'user_location_vouchers';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LocationVoucherEntity, {
    createForeignKeyConstraints: false,
    nullable: false,
  })
  @JoinColumn({ name: 'voucher_id' })
  voucher: LocationVoucherEntity;

  @Column({ name: 'voucher_id' })
  voucherId: string;

  @ManyToOne(() => UserProfileEntity, {
    createForeignKeyConstraints: false,
    nullable: false,
  })
  @JoinColumn({ name: 'user_profile_id' })
  userProfile: UserProfileEntity;

  @Column({ name: 'user_profile_id' })
  userProfileId: string;

  @Column({ name: 'used_count', type: 'integer', default: 0 })
  usedCount: number;
}
