// Account.entity.ts
import { Role } from '@/common/constants/Role.constant';
import { CommentEntity } from '@/modules/post/domain/Comment.entity';
import { PostEntity } from '@/modules/post/domain/Post.entity';
import { ReactEntity } from '@/modules/post/domain/React.entity';
import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BusinessEntity } from '@/modules/account/domain/Business.entity';
import { CreatorProfileEntity } from '@/modules/account/domain/CreatorProfile.entity';

@Entity({ name: 'accounts' })
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name', type: 'varchar', length: 255 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 255 })
  lastName: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 255 })
  phoneNumber: string;

  @Column({ name: 'password', type: 'varchar', length: 255 })
  password: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'cover_url', type: 'varchar', nullable: true })
  coverUrl: string | null;

  @Column({ name: 'has_onboarded', type: 'boolean', default: false })
  hasOnboarded: boolean;

  @Column({ name: 'role', type: 'varchar', length: 50, default: Role.USER })
  role: Role;

  /**
   * Locked accounts cannot login
   */
  @Column({ name: 'is_locked', type: 'boolean', default: false })
  isLocked: boolean;

  @Column({
    name: 'suspended_until',
    type: 'timestamp with time zone',
    nullable: true,
  })
  suspendedUntil: Date | null;

  @Column({
    name: 'suspension_reason',
    type: 'varchar',
    length: 555,
    nullable: true,
  })
  suspensionReason: string | null;

  @Column({ name: 'suspended_by', type: 'uuid', nullable: true })
  suspendedById?: string | null;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  @JoinColumn({ name: 'suspended_by' })
  suspendedBy: AccountEntity | null;

  @OneToMany(() => PostEntity, (post) => post.author)
  posts: PostEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments: CommentEntity[];

  @OneToMany(() => ReactEntity, (react) => react.author)
  reacts: ReactEntity[];

  @OneToOne(() => UserProfileEntity, (profile) => profile.account, {
    cascade: true,
  })
  userProfile?: UserProfileEntity;

  @OneToOne(() => BusinessEntity, (business) => business.account, {
    cascade: true,
  })
  businessProfile?: BusinessEntity;

  @OneToOne(() => CreatorProfileEntity, (creator) => creator.account, {
    createForeignKeyConstraints: false,
  })
  creatorProfile?: CreatorProfileEntity;

  public canCreateEvent(): boolean {
    return this.role === Role.EVENT_CREATOR && this.hasOnboarded;
  }

  public canPerformActions(): boolean {
    return this.hasOnboarded;
  }

  public suspend(
    suspendedUntil: Date,
    suspensionReason: string,
    suspendedById?: string | null,
  ): AccountEntity {
    this.suspendedUntil = suspendedUntil;
    this.suspensionReason = suspensionReason;
    this.suspendedById = suspendedById;

    return this;
  }

  public isSuspended(): boolean {
    const now = new Date();
    return !!this.suspendedUntil && this.suspendedUntil > now;
  }
}
