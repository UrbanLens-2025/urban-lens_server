import {
  BusinessCategory,
  BusinessRequestStatus,
} from '@/common/constants/Business.constant';
import { AccountEntity } from '@/modules/auth/domain/Account.entity';
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

@Entity({ name: 'business' })
export class BusinessEntity {
  @PrimaryColumn({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @OneToOne(() => AccountEntity, (account) => account.business, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;

  @Column({ name: 'website', type: 'varchar', length: 255 })
  website: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'address', type: 'varchar', length: 255 })
  address: string;

  @Column({ name: 'city', type: 'varchar', length: 255 })
  city: string;

  @Column({ name: 'state', type: 'varchar', length: 255 })
  state: string;

  @Column({ name: 'zip_code', type: 'varchar', length: 255 })
  zipCode: string;

  @Column({ name: 'country', type: 'varchar', length: 255 })
  country: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'license_number', type: 'varchar', length: 255 })
  licenseNumber: string;

  @Column({ name: 'license_expiration_date', type: 'varchar', length: 255 })
  licenseExpirationDate: string;

  @Column({ name: 'license_type', type: 'varchar', length: 255 })
  licenseType: string;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
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

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  reviewedBy: string | null;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date | null;

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
}
