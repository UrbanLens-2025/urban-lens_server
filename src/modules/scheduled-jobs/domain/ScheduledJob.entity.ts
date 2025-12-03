import { ScheduledJobStatus } from '@/common/constants/ScheduledJobStatus.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Index(['executeAt', 'status'])
@Entity({ name: ScheduledJobEntity.TABLE_NAME })
export class ScheduledJobEntity {
  public static readonly TABLE_NAME = 'scheduled_jobs';

  @PrimaryGeneratedColumn('identity')
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ name: 'job_type', type: 'varchar', length: 255 })
  jobType: string;

  @Column({ name: 'execute_at', type: 'timestamp with time zone' })
  executeAt: Date;

  @Column({ name: 'payload', type: 'jsonb' })
  payload: Record<string, any>;

  // stores the id of the associated entity
  @Column({
    name: 'associated_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  associatedId?: string | null;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 100,
    default: ScheduledJobStatus.PENDING,
  })
  status: ScheduledJobStatus;

  @Column({
    name: 'closed_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  closedAt?: Date | null;
}
