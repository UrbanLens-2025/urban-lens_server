import { AccountEntity } from '@/modules/account/domain/Account.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
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

  @Column({ name: 'type', type: 'varchar', length: 50, nullable: false })
  type: PostType;

  @Column({ name: 'rating', type: 'int', nullable: true })
  rating?: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  // soft deletes only
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone' })
  deletedAt: Date;

  @Column({ name: 'image_urls', type: 'text', array: true, default: [] })
  imageUrls: string[];

  @Column({ name: 'video_urls', type: 'text', array: true, default: [] })
  videoUrls: string[];

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    nullable: false,
    onDelete: 'CASCADE',
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'author_id' })
  author: AccountEntity;

  @Column({ name: 'author_id', type: 'uuid', nullable: false })
  authorId: string;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId: string;

  @Column({ name: 'event_id', type: 'uuid', nullable: true })
  eventId: string;

  @Column({
    name: 'visibility',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  visibility: Visibility;

  @OneToMany(() => CommentEntity, (comment) => comment.post, {
    cascade: ['remove'],
    createForeignKeyConstraints: false,
  })
  comments: CommentEntity[];

  @OneToMany(() => ReactEntity, (react) => react.entityId, {
    cascade: ['remove'],
    createForeignKeyConstraints: false,
  })
  reacts: ReactEntity[];

  @PrimaryGeneratedColumn('uuid', { name: 'post_id' })
  postId: string;

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'is_hidden', type: 'boolean', default: false })
  isHidden: boolean;

  public turnIntoBlog(): PostEntity {
    this.type = PostType.BLOG;
    this.rating = undefined;
    this.visibility = Visibility.PUBLIC;
    return this;
  }

  public turnIntoLocationReview() {
    this.type = PostType.REVIEW;
    return this;
  }

  public canAddComments(): boolean {
    return true; // Add check here for future code (e.g., if post is banned, then cannot add comments)
  }
}
