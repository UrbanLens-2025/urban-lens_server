import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'report_reasons' })
export class ReportReasonEntity {
  @PrimaryColumn({ name: 'key', type: 'varchar', length: 100 })
  key: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ name: 'display_name', type: 'varchar', length: 255 })
  displayName: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;
}
