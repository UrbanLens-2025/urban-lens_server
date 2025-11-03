import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { DayOfWeek } from '@/common/constants/DayOfWeek.constant';

@Entity({ name: LocationOpeningHoursEntity.TABLE_NAME })
@Index(['locationId', 'dayOfWeek'], { unique: true })
export class LocationOpeningHoursEntity {
  public static readonly TABLE_NAME = 'location_opening_hours';

  @PrimaryGeneratedColumn('identity')
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => LocationEntity, (location) => location.id, {
    createForeignKeyConstraints: false,
    nullable: false,
  })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @Column({ name: 'day_of_week', type: 'varchar', length: 20 })
  dayOfWeek: DayOfWeek;

  @Column({ name: 'start_time', type: 'time without time zone' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time without time zone' })
  endTime: string;
}
