import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Notification } from 'firebase-admin/messaging';
import { PushNotificationStatus } from '@/common/constants/PushNotificationStatus.constant';
import { AccountEntity } from '@/modules/account/domain/Account.entity';

@Entity({ name: 'push-notification' })
export class PushNotificationEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ name: 'type', type: 'varchar', length: 50, nullable: false })
  type: string;

  @Column({ name: 'payload', type: 'jsonb' })
  payload: Notification;

  @ManyToOne(() => AccountEntity, (user) => user.id, {
    nullable: false,
    lazy: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'to_user_id' })
  toUser: AccountEntity;

  @Column({ name: 'to_user_id', type: 'uuid', nullable: false })
  toUserId: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PushNotificationStatus,
    default: PushNotificationStatus.UNSEEN,
  })
  status: PushNotificationStatus;
}
