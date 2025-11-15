import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';
import { LocationEntity } from '@/modules/business/domain/Location.entity';

@Entity('one_time_qr_codes')
export class OneTimeQRCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'qr_code_data',
    type: 'text',
  })
  qrCodeData: string;

  @Column({
    name: 'qr_code_url',
    type: 'text',
  })
  qrCodeUrl: string;

  @Column({
    name: 'location_id',
    type: 'uuid',
  })
  locationId: string;

  @Column({
    name: 'business_owner_id',
    type: 'uuid',
  })
  businessOwnerId: string;

  @Column({
    name: 'scanned_by',
    type: 'uuid',
    nullable: true,
  })
  scannedBy: string | null;

  @Column({
    name: 'scanned_at',
    type: 'timestamp',
    nullable: true,
  })
  scannedAt: Date | null;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
  })
  expiresAt: Date;

  @Column({
    name: 'is_used',
    type: 'boolean',
    default: false,
  })
  isUsed: boolean;

  @Column({
    name: 'reference_id',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'ID của đơn hàng hoặc giao dịch',
  })
  referenceId: string | null;

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => LocationEntity, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;

  @ManyToOne(() => UserProfileEntity, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'scanned_by' })
  scannedByUser: UserProfileEntity;

  @ManyToOne(() => UserProfileEntity, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'business_owner_id' })
  businessOwner: UserProfileEntity;
}
