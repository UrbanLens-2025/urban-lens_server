import { AccountEntity } from '@/modules/auth/domain/Account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum FollowEntityType {
  USER = 'user',
  LOCATION = 'location',
}

@Entity({ name: 'follows' })
export class FollowEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'follow_id' })
  followId: string;

  @Column({ name: 'follower_id', type: 'uuid' })
  followerId: string;

  @ManyToOne(() => AccountEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'follower_id' })
  follower: AccountEntity;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: FollowEntityType,
  })
  entityType: FollowEntityType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
