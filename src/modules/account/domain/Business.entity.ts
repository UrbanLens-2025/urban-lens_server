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
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BusinessLicenseJson } from '@/common/json/BusinessLicense.json';

@Entity({ name: BusinessEntity.TABLE_NAME })
export class BusinessEntity {
  public static readonly TABLE_NAME = 'business';

  @PrimaryColumn({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @OneToOne(() => AccountEntity, (account) => account.businessProfile, {
    onDelete: 'CASCADE',
    createForeignKeyConstraints: true,
  })
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;

  @Column({ name: 'avatar', type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({ name: 'website', type: 'varchar', length: 255 })
  website: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({
    name: 'address_line',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  addressLine?: string | null;

  @Column({
    name: 'address_level_1',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  addressLevel1?: string | null;

  @Column({
    name: 'address_level_2',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  addressLevel2?: string | null;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'licenses', type: 'jsonb', nullable: true })
  licenses: BusinessLicenseJson[];

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
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
    type: 'varchar',
    length: 50,
    default: BusinessCategory.OTHER,
  })
  category: BusinessCategory;

  @OneToMany(() => LocationEntity, (location) => location.business, {
    cascade: true,
    createForeignKeyConstraints: true,
  })
  locations: LocationEntity[];

  @Column({ name: 'processed_by', type: 'uuid', nullable: true })
  processedById: string | null;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: true,
    nullable: true,
  })
  @JoinColumn({ name: 'processed_by' })
  processedBy?: AccountEntity | null;

  @Column({
    name: 'processed_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  processedAt?: Date | null;

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
