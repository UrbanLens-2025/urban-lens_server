// Post.entity.ts
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
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CommentEntity } from './Comment.entity';
import { PostSummaryEntity } from './PostSummary.entity';

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

  @Column({ name: 'image_urls', type: 'text', array: true })
  imageUrls: string[];

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    nullable: false,
    onDelete: 'CASCADE',
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'author_id' })
  author: AccountEntity;

  @Column({ name: 'author_id' })
  authorId: string;

  @OneToMany(() => CommentEntity, (comment) => comment.post)
  comments: CommentEntity[];

  @OneToOne(() => PostSummaryEntity, (summary) => summary.postId, {
    cascade: true,
  })
  postSummary: PostSummaryEntity;
}
