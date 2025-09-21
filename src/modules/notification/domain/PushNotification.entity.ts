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
import { UserEntity } from '@/modules/auth/domain/User.entity';

@Entity({ name: 'push-notification' })
export class PushNotificationEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @CreateDateColumn()
  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'type', type: 'varchar', length: 50, nullable: false })
  type: string;

  @Column({ name: 'payload', type: 'jsonb' })
  payload: Notification;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    nullable: false,
    lazy: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'to_user_id' })
  toUser: UserEntity;

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
