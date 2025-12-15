// Comment.entity.ts
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { PostEntity } from './Post.entity';
import { ReactEntity } from './React.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'comments' })
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'comment_id' })
  commentId: string;

  @Column({ name: 'content', type: 'text', nullable: false })
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    nullable: false,
    onDelete: 'CASCADE',
    createForeignKeyConstraints: true,
  })
  @JoinColumn({ name: 'author_id' })
  author: AccountEntity;

  @ManyToOne(() => PostEntity, (post) => post.postId, {
    nullable: false,
    onDelete: 'CASCADE',
    createForeignKeyConstraints: true,
  })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;

  @OneToMany(() => ReactEntity, (react) => react.entityId, {
    cascade: ['remove'],
    createForeignKeyConstraints: true,
  })
  reacts: ReactEntity[];

  // Analytics columns (migrated from analytic table)
  @Column({ name: 'total_upvotes', type: 'int', default: 0 })
  totalUpvotes: number;

  @Column({ name: 'total_downvotes', type: 'int', default: 0 })
  totalDownvotes: number;
}
