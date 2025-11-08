import { LocationEntity } from '@/modules/business/domain/Location.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { UpdateDateColumn } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';

export enum LocationVoucherType {
  PUBLIC = 'public', // Ai cũng có thể redeem
  MISSION_ONLY = 'mission_only', // Chỉ user đã check-in mới có thể redeem
}

@Entity({ name: LocationVoucherEntity.TABLE_NAME })
export class LocationVoucherEntity {
  public static readonly TABLE_NAME = 'location_vouchers';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'location_id' })
  locationId: string;

  @ManyToOne(() => LocationEntity, {
    createForeignKeyConstraints: false,
    nullable: false,
  })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'description' })
  description: string;

  @Column({
    name: 'voucher_code',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  voucherCode: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ name: 'price_point', type: 'integer', default: 0 })
  pricePoint: number;

  @Column({ name: 'max_quantity', type: 'integer', default: 0 })
  maxQuantity: number;

  @Column({ name: 'user_redeemed_limit', type: 'integer', default: 0 })
  userRedeemedLimit: number;

  @Column({
    name: 'voucher_type',
    type: 'varchar',
    length: 50,
    default: LocationVoucherType.PUBLIC,
  })
  voucherType: LocationVoucherType;

  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp with time zone' })
  endDate: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
