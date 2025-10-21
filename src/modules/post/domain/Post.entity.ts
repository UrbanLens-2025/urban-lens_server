import { AccountEntity } from '@/modules/account/domain/Account.entity';
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

export enum PostType {
  BLOG = 'blog',
  REVIEW = 'review',
}

export enum Visibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  FOLLOWERS = 'followers',
}

@Entity({ name: 'posts' })
export class PostEntity {
  @Column({ name: 'content', type: 'text', nullable: false })
  content: string;

  @Column({ name: 'type', type: 'enum', enum: PostType, nullable: false })
  type: PostType;

  @Column({ name: 'rating', type: 'int', nullable: true })
  rating: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
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

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId: string;

  @Column({ name: 'event_id', type: 'uuid', nullable: true })
  eventId: string;

  @Column({
    name: 'visibility',
    type: 'enum',
    enum: Visibility,
    nullable: true,
  })
  visibility: Visibility;

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

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'is_hidden', type: 'boolean', default: false })
  isHidden: boolean;
}
