import { AccountEntity } from '@/modules/auth/domain/Account.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { PrimaryGeneratedColumn } from 'typeorm';
import { CommentEntity } from './Comment.entity';

@Entity({ name: 'posts' })
export class PostEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'post_id' })
  postId: string;

  @Column({ name: 'content', type: 'text', nullable: false })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => AccountEntity, (account) => account.posts, {
    nullable: false,
  })
  @JoinColumn({ name: 'author_id' })
  author: AccountEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];

  @OneToOne(() => PostSummaryEntity, (summary) => summary.post, {
    cascade: true,
  })
  postSummary: PostSummaryEntity;
}

@Entity({ name: 'post_summary' })
export class PostSummaryEntity {
  @PrimaryColumn({ name: 'post_id', type: 'uuid' })
  postId: string;

  @OneToOne(() => PostEntity, (post) => post.postSummary, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: PostEntity;

  @Column({ name: 'total_comments', type: 'integer', default: 0 })
  totalComments: number;

  @Column({ name: 'total_likes', type: 'integer', default: 0 })
  totalLikes: number;

  @Column({ name: 'total_dislikes', type: 'integer', default: 0 })
  totalDislikes: number;
}
