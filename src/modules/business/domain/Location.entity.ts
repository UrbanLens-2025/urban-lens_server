import { BusinessEntity } from '@/modules/account/domain/Business.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @ManyToOne(() => BusinessEntity, (business) => business.locations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'business_id' })
  business: BusinessEntity;
}
