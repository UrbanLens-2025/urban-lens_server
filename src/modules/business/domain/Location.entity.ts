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

@Entity({ name: LocationEntity.TABLE_NAME })
export class LocationEntity {
  public static readonly TABLE_NAME = 'locations';

  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ type: 'text', array: true, nullable: true })
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

  @OneToMany(
    () => LocationTagsEntity,
    (locationTags) => locationTags.location,
    {
      createForeignKeyConstraints: false,
    },
  )
  tags: LocationTagsEntity[];

  //#endregion

  @BeforeInsert()
  @BeforeUpdate()
  setGeom() {
    if (this.latitude && this.longitude) {
      // i have to add the function wrapper so typeorm executes the postgis functions on db side
      this.geom = () =>
        `ST_SetSRID(ST_MakePoint(${this.longitude}, ${this.latitude}), 4326)::geography`;
    }
  }

  //#region Domain methods

  canBeViewedOnMap(): boolean {
    return this.isVisibleOnMap;
  }

  //#endregion
}
