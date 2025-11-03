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
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { LocationAvailabilityStatus } from '@/common/constants/LocationAvailabilityStatus.constant';
import { DayOfWeek } from '@/common/constants/DayOfWeek.constant';

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

  @Column({ name: 'day_of_week', type: 'varchar', length: 20 })
  dayOfWeek: DayOfWeek;

  @Column({ name: 'start_time', type: 'time without time zone' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time without time zone' })
  endTime: string;

  @Column({ name: 'status', type: 'varchar', length: 50 })
  status: LocationAvailabilityStatus;

  @Column({ name: 'note', type: 'text', nullable: true })
  note: string | null;
}
