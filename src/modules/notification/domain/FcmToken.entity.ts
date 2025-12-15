import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { AccountEntity } from '@/modules/account/domain/Account.entity';

@Entity({ name: 'fcm_token' })
@Unique(['token', 'userId'])
export class FcmTokenEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ name: 'token', type: 'varchar', length: 555 })
  token: string;

  @Column({ name: 'device_info', type: 'varchar', length: 255, nullable: true })
  deviceInfo: string | null;

  @ManyToOne(() => AccountEntity, (user) => user.id, {
    nullable: false,
    lazy: true,
    createForeignKeyConstraints: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: AccountEntity;

  @Column({ name: 'user_id' })
  userId: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
