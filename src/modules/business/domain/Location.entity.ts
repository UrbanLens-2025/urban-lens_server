import { BusinessEntity } from '@/modules/account/domain/Business.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CheckInEntity } from './CheckIn.entity';
import { LocationRequestEntity } from '@/modules/business/domain/LocationRequest.entity';

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
  addressLine: string;

  @Column({ name: 'address_level_1', type: 'varchar', length: 100 })
  addressLevel1: string;

  @Column({ name: 'address_level_2', type: 'varchar', length: 100 })
  addressLevel2: string;

  @Column({ type: 'text', array: true, nullable: true })
  imageUrl: string[];

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

  @OneToOne(
    () => LocationRequestEntity,
    (locationRequest) => locationRequest.id,
    {
      createForeignKeyConstraints: false,
      nullable: true,
    },
  )
  @JoinColumn({ name: 'source_location_request_id' })
  sourceLocationRequest: LocationRequestEntity;

  @Column({ name: 'source_location_request_id', type: 'uuid', nullable: true })
  sourceLocationRequestId: string;

  @OneToMany(() => CheckInEntity, (checkIn) => checkIn.location)
  checkIns: CheckInEntity[];
}
