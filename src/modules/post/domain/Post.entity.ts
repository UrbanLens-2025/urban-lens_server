import { AccountEntity } from '@/modules/auth/domain/Account.entity';
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
import { CommentEntity } from './Comment.entity';
import { ReactEntity } from './React.entity';

@Entity({ name: 'posts' })
export class PostEntity {
  @Column({ name: 'content', type: 'text', nullable: false })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'image_urls', type: 'text', array: true, default: [] })
  imageUrls: string[];

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'author_id' })
  author: AccountEntity;

  @Column({ name: 'author_id' })
  authorId: string;

  @OneToMany(() => CommentEntity, (comment) => comment.post, {
    cascade: ['remove'],
  })
  comments: CommentEntity[];

  @OneToMany(() => ReactEntity, (react) => react.entityId, {
    cascade: ['remove'],
  })
  reacts: ReactEntity[];

  @PrimaryGeneratedColumn('uuid', { name: 'post_id' })
  postId: string;
}
