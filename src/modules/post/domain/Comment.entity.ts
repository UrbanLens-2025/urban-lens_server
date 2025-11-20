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
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'author_id' })
  author: AccountEntity;

  @Column({ name: 'author_id', type: 'uuid', nullable: false })
  authorId: string;

  @ManyToOne(() => PostEntity, (post) => post.postId, {
    nullable: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;

  @Column({ name: 'post_id', type: 'uuid', nullable: false })
  postId: string;

  // reverse relationships

  @OneToMany(() => ReactEntity, (react) => react.entityId, {
    cascade: ['remove'],
    createForeignKeyConstraints: false,
  })
  reacts: ReactEntity[];
}
