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
import { LocationRequestStatus } from '@/common/constants/Location.constant';
import { LocationValidationDocumentsJson } from '@/common/json/LocationValidationDocuments.json';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { LocationRequestTagsEntity } from '@/modules/business/domain/LocationRequestTags.entity';
import { LocationRequestType } from '@/common/constants/LocationRequestType.constant';
import { LocationEntity } from '@/modules/business/domain/Location.entity';

@Entity({ name: LocationRequestEntity.TABLE_NAME })
export class LocationRequestEntity {
  public static readonly TABLE_NAME = 'location_requests';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: AccountEntity;

  @Column({ name: 'created_by', type: 'uuid' })
  createdById: string;

  @Column({
    name: 'type',
    type: 'varchar',
    length: 50,
    default: LocationRequestType.BUSINESS_OWNED,
  })
  type: LocationRequestType;

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

  @Column({
    name: 'location_image_urls',
    type: 'text',
    array: true,
    nullable: true,
  })
  locationImageUrls: string[];

  @Column({
    name: 'location_validation_documents',
    type: 'jsonb',
    nullable: true,
  })
  locationValidationDocuments: LocationValidationDocumentsJson[];

  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
    default: LocationRequestStatus.AWAITING_ADMIN_REVIEW,
  })
  status: LocationRequestStatus;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'processed_by' })
  processedBy: AccountEntity | null;

  @Column({ name: 'processed_by', type: 'uuid', nullable: true })
  processedById: string | null;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string | null;

  @OneToMany(() => LocationRequestTagsEntity, (tags) => tags.locationRequest, {
    createForeignKeyConstraints: false,
  })
  tags: LocationRequestTagsEntity[];

  @OneToOne(
    () => LocationEntity,
    (location) => location.sourceLocationRequest,
    {
      createForeignKeyConstraints: false,
    },
  )
  createdLocation: LocationEntity;

  canBeUpdated(): boolean {
    const updatableStatuses = [LocationRequestStatus.AWAITING_ADMIN_REVIEW];
    return updatableStatuses.includes(this.status);
  }

  canBeProcessed(): boolean {
    const processableStatuses = [LocationRequestStatus.AWAITING_ADMIN_REVIEW];
    return processableStatuses.includes(this.status);
  }

  // transient fields
  distanceMeters?: number;
}
