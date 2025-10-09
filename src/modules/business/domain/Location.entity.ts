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

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ type: 'text', array: true, nullable: true })
  imageUrl: string[];

  @Column({ name: 'is_available_for_rent', type: 'boolean', default: false })
  isAvailableForRent: boolean;

  @Column({
    name: 'rental_price_per_hour',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  rentalPricePerHour: number | null;

  @Column({
    name: 'rental_price_per_day',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  rentalPricePerDay: number | null;

  @Column({
    name: 'rental_price_per_month',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  rentalPricePerMonth: number | null;

  @Column({ name: 'rental_notes', type: 'text', nullable: true })
  rentalNotes: string | null;

  @Column({ name: 'business_id', type: 'uuid' })
  businessId: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: LocationRequestStatus,
    default: LocationRequestStatus.PENDING,
  })
  status: LocationRequestStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => BusinessEntity, (business) => business.locations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business: BusinessEntity;

  @OneToMany(() => CheckInEntity, (checkIn) => checkIn.location)
  checkIns: CheckInEntity[];
}
