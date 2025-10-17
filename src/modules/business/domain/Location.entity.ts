import { BusinessEntity } from '@/modules/account/domain/Business.entity';
import { LocationRequestStatus } from '@/common/constants/Location.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CheckInEntity } from './CheckIn.entity';

@Entity('locations')
export class LocationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ name: 'address_line', type: 'varchar', length: 255 })
  address_line: string;

  @Column({ name: 'address_level_1', type: 'varchar', length: 100 })
  addressLevel1: string;

  @Column({ name: 'address_level_2', type: 'varchar', length: 100 })
  addressLevel2: string;

  @Column({ type: 'text', array: true, nullable: true })
  imageUrl: string[];

  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
    default: LocationRequestStatus.AWAITING_ADMIN_REVIEW,
  })
  status: LocationRequestStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => BusinessEntity, (business) => business.locations, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'business_id' })
  business: BusinessEntity;

  @Column({ name: 'business_id', type: 'uuid' })
  businessId: string;

  @OneToMany(() => CheckInEntity, (checkIn) => checkIn.location)
  checkIns: CheckInEntity[];
}
