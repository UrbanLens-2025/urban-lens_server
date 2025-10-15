import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountEntity } from '@/modules/auth/domain/Account.entity';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { LocationAvailabilityStatus } from '@/common/constants/LocationAvailabilityStatus.constant';
import { LocationAvailabilitySource } from '@/common/constants/LocationAvailabilitySource.constant';

@Entity({ name: LocationAvailabilityEntity.TABLE_NAME })
export class LocationAvailabilityEntity {
  public static readonly TABLE_NAME = 'location_availability';

  @PrimaryGeneratedColumn('identity')
  id: number;

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

  @ManyToOne(() => LocationEntity, (location) => location.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  //

  @Column({ name: 'start_date_time', type: 'timestamp with time zone' })
  startDateTime: Date;

  @Column({ name: 'end_date_time', type: 'timestamp with time zone' })
  endDateTime: Date;

  @Column({ name: 'status', type: 'varchar', length: 50 })
  status: LocationAvailabilityStatus;

  @Column({ name: 'source', type: 'varchar', length: 50 })
  source: LocationAvailabilitySource;

  @Column({ name: 'note', type: 'text', nullable: true })
  note: string | null;

  public canBeRemoved(): boolean {
    const now = new Date();
    return this.endDateTime >= now;
  }

  public canBeUpdated(): boolean {
    const now = new Date();
    return this.endDateTime >= now;
  }
}
