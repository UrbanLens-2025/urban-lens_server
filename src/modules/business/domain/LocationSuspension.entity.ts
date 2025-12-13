import { LocationEntity } from '@/modules/business/domain/Location.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { LocationSuspensionType } from '@/common/constants/LocationSuspensionType.constant';

@Entity({ name: LocationSuspensionEntity.TABLE_NAME })
export class LocationSuspensionEntity {
  public static readonly TABLE_NAME = 'location_booking_suspensions';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => LocationEntity, (location) => location.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @Column({ name: 'suspended_until', type: 'timestamp with time zone' })
  suspendedUntil: Date;

  @Column({ name: 'suspension_reason', type: 'varchar', length: 555 })
  suspensionReason: string;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'suspended_by' })
  suspendedBy: AccountEntity;

  @Column({ name: 'suspended_by', type: 'uuid' })
  suspendedById: string;

  @Column({ name: 'suspension_type', type: 'varchar', length: 50 })
  suspensionType: LocationSuspensionType;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
