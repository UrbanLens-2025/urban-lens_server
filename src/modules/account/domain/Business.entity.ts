import {
  BusinessCategory,
  BusinessRequestStatus,
} from '@/common/constants/Business.constant';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: BusinessEntity.TABLE_NAME })
export class BusinessEntity {
  public static readonly TABLE_NAME = 'business';

  @PrimaryColumn({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @OneToOne(() => AccountEntity, (account) => account.businessProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;

  @Column({ name: 'avatar', type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({ name: 'website', type: 'varchar', length: 255 })
  website: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'address_line', type: 'varchar', length: 255 })
  addressLine: string;

  @Column({ name: 'address_level_1', type: 'varchar', length: 255 })
  addressLevel1: string;

  @Column({ name: 'address_level_2', type: 'varchar', length: 255 })
  addressLevel2: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'license_number', type: 'varchar', length: 255 })
  licenseNumber: string;

  @Column({ name: 'license_expiration_date', type: 'varchar', length: 255 })
  licenseExpirationDate: string;

  @Column({ name: 'license_type', type: 'varchar', length: 255 })
  licenseType: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({
    name: 'status',
    type: 'enum',
    enum: BusinessRequestStatus,
    default: BusinessRequestStatus.PENDING,
  })
  status: BusinessRequestStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string | null;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ name: 'phone', type: 'varchar', length: 255, nullable: false })
  phone: string;

  @Column({
    name: 'category',
    type: 'enum',
    enum: BusinessCategory,
    default: BusinessCategory.OTHER,
  })
  category: BusinessCategory;

  @OneToMany(() => LocationEntity, (location) => location.business, {
    cascade: true,
  })
  locations: LocationEntity[];

  canBeUpdated(): boolean {
    return this.status === BusinessRequestStatus.PENDING;
  }

  canBeProcessed(): boolean {
    return this.status === BusinessRequestStatus.PENDING;
  }

  canCreateLocation(): boolean {
    return this.status === BusinessRequestStatus.APPROVED && this.isActive;
  }
}
