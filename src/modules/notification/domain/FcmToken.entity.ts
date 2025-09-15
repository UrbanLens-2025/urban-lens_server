import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { UserEntity } from '@/modules/auth/domain/User.entity';

@Entity({ name: 'fcm-token' })
@Unique(['token'])
export class FcmTokenEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column({ name: 'token', type: 'varchar', length: 555 })
  token: string;

  @Column({ name: 'device_info', type: 'varchar', length: 255, nullable: true })
  deviceInfo: string | null;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    nullable: false,
    lazy: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ name: 'user_id' })
  userId: string;

  @CreateDateColumn()
  @Column({ name: 'created_at' })
  createdAt: Date;
}
