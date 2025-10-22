import { AccountEntity } from '@/modules/account/domain/Account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ReactType {
  UPVOTE = 'upvote',
  DOWNVOTE = 'downvote',
}

export enum ReactEntityType {
  POST = 'post',
  COMMENT = 'comment',
}

@Entity({ name: 'reacts' })
export class ReactEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entity_id', type: 'uuid' })
  entityId: string;

  @Column({ name: 'entity_type' })
  entityType: ReactEntityType;

  @Column({ name: 'type', type: 'enum', enum: ReactType })
  type: ReactType;

  @ManyToOne(() => AccountEntity, (account) => account.reacts, {
    nullable: false,
    onDelete: 'CASCADE',
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'author_id' })
  author: AccountEntity;

  @Column({ name: 'author_id' })
  authorId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
