import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';
import { LocationVoucherEntity } from './LocationVoucher.entity';

@Entity({ name: UserLocationVoucherExchangeHistoryEntity.TABLE_NAME })
export class UserLocationVoucherExchangeHistoryEntity {
  public static readonly TABLE_NAME =
    'user_location_voucher_exchange_histories';

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

  @Column({ name: 'point_spent' })
  pointSpent: number;

  @Column({
    name: 'user_voucher_code',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  userVoucherCode: string;

  @Column({ name: 'used_at', type: 'timestamp with time zone', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
