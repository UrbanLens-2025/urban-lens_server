import { BusinessEntity } from '@/modules/account/domain/Business.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CheckInEntity } from './CheckIn.entity';
import { LocationRequestEntity } from '@/modules/business/domain/LocationRequest.entity';
import { LocationTagsEntity } from '@/modules/business/domain/LocationTags.entity';
import { LocationOwnershipType } from '@/common/constants/LocationType.constant';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { LocationBookingConfigEntity } from '@/modules/location-booking/domain/LocationBookingConfig.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { LocationAvailabilityEntity } from '@/modules/location-booking/domain/LocationAvailability.entity';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';

@Entity({ name: LocationEntity.TABLE_NAME })
export class LocationEntity {
  public static readonly TABLE_NAME = 'locations';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => AccountEntity, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: AccountEntity;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedById: string;

  // consider refactoring business to something else
  @ManyToOne(() => BusinessEntity, (business) => business.locations, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  @JoinColumn({ name: 'business_id' })
  business: BusinessEntity;

  @Column({ name: 'business_id', type: 'uuid', nullable: true })
  businessId: string;

  @Column({
    name: 'ownership_type',
    type: 'varchar',
    length: 50,
    default: LocationOwnershipType.OWNED_BY_BUSINESS,
  })
  ownershipType: LocationOwnershipType;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ name: 'radius_meters', type: 'integer', default: 0 })
  radiusMeters: number;

  @Column({ name: 'address_line', type: 'varchar', length: 255 })
  addressLine: string;

  @Column({ name: 'address_level_1', type: 'varchar', length: 100 })
  addressLevel1: string;

  @Column({ name: 'address_level_2', type: 'varchar', length: 100 })
  addressLevel2: string;

  @Column({ name: 'image_url', type: 'text', array: true, nullable: true })
  imageUrl: string[];

  @Column({ name: 'is_visible_on_map', type: 'boolean', default: false })
  isVisibleOnMap: boolean;

  @Column({
    name: 'geom',
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  geom: string | (() => string);

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

  //#region TRANSIENT FIELDS - Do NOT add @Column to these. These are NOT PERSISTED to the db.

  distanceMeters?: number;

  //#endregion

  //#region TRANSIENT RELATIONS - These are for development purposes ONLY.

  @OneToMany(() => LocationAvailabilityEntity, (a) => a.location, {
    createForeignKeyConstraints: false,
  })
  availabilities: LocationAvailabilityEntity[];

  @OneToMany(
    () => LocationTagsEntity,
    (locationTags) => locationTags.location,
    {
      createForeignKeyConstraints: false,
    },
  )
  tags: LocationTagsEntity[];

  @OneToOne(
    () => LocationBookingConfigEntity,
    (bookingConfig) => bookingConfig.location,
    {
      createForeignKeyConstraints: false,
    },
  )
  bookingConfig: LocationBookingConfigEntity;

  @OneToMany(() => LocationBookingEntity, (booking) => booking.location, {
    createForeignKeyConstraints: false,
  })
  bookings: LocationBookingEntity[];

  // Analytics columns (migrated from location_analytics table)
  @Column({ name: 'total_posts', type: 'bigint', default: 0 })
  totalPosts: number;

  @Column({ name: 'total_check_ins', type: 'bigint', default: 0 })
  totalCheckIns: number;

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews: number;

  @Column({
    name: 'average_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  averageRating: number;

  //#endregion

  @BeforeInsert()
  @BeforeUpdate()
  setGeom() {
    if (
      this.latitude !== null &&
      this.latitude !== undefined &&
      this.longitude !== null &&
      this.longitude !== undefined
    ) {
      // i have to add the function wrapper so typeorm executes the postgis functions on db side
      this.geom = () =>
        `ST_SetSRID(ST_MakePoint(${this.longitude}, ${this.latitude}), 4326)::geography`;
    }
  }

  //#region Domain methods

  canBeViewedOnMap(): boolean {
    return this.isVisibleOnMap;
  }

  canBeBooked(): boolean {
    const bookingConfig = this.bookingConfig;
    if (!bookingConfig) {
      throw new InternalServerErrorException(
        'Location booking config not loaded',
      );
    }

    return bookingConfig.allowBooking;
  }

  //#endregion
}
