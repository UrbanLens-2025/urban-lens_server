import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'email_notification' })
export class EmailNotificationEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ name: 'subject', type: 'varchar', length: 1000, nullable: false })
  subject: string;

  @Column({ name: 'to', type: 'varchar', length: 255, nullable: false })
  to: string;

  @Column({ name: 'has_sent', type: 'boolean', default: false })
  hasSent: boolean;

  @Column({ name: 'type', type: 'varchar', length: 255, nullable: false })
  type: string;

  @Column({ name: 'context', type: 'jsonb', nullable: true })
  context: Record<string, any>;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date;
}
