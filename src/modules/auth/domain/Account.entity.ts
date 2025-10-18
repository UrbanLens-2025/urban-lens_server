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
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BusinessEntity } from '@/modules/account/domain/Business.entity';

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

  @Column({ name: 'is_verified', type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ name: 'avatar_url', type: 'varchar', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'cover_url', type: 'varchar', nullable: true })
  coverUrl: string | null;

  @Column({ name: 'has_onboarded', type: 'boolean', default: false })
  hasOnboarded: boolean;

  @Column({ name: 'role', type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @OneToMany(() => PostEntity, (post) => post.author)
  posts: PostEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments: CommentEntity[];

  @OneToMany(() => ReactEntity, (react) => react.author)
  reacts: ReactEntity[];

  @OneToOne(() => UserProfileEntity, (profile) => profile.account, {
    cascade: true,
  })
  profile: UserProfileEntity;

  @OneToOne(() => BusinessEntity, (business) => business.account, {
    cascade: true,
  })
  business: BusinessEntity;

  public canCreateEvent(): boolean {
    return this.role === Role.EVENT_CREATOR && this.hasOnboarded;
  }
}
