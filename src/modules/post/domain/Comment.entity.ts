import { AccountEntity } from '@/modules/auth/domain/Account.entity';
import { PostEntity } from '@/modules/post/domain/Post.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'comments' })
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  commentId: string;

  @Column({ name: 'content', type: 'text', nullable: false })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @Column({ name: 'author_id', type: 'uuid', nullable: false })
  @ManyToOne(() => AccountEntity, (account) => account.id)
  author: AccountEntity;

  @Column({ name: 'post_id', type: 'uuid', nullable: false })
  @ManyToOne(() => PostEntity, (post) => post.postId)
  post: PostEntity;
}
