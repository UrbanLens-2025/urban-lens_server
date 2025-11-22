import { ReportStatus } from '@/common/constants/ReportStatus.constant';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { PostEntity } from '@/modules/post/domain/Post.entity';
import { ReportReasonEntity } from '@/modules/report/domain/ReportReason.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ReportEntityType {
  POST = 'post',
  LOCATION = 'location',
  EVENT = 'event',
}

@Entity({ name: 'reports' })
export class ReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'target_type', type: 'varchar', length: 50 })
  targetType: ReportEntityType;

  @Column({ name: 'target_id', type: 'uuid' })
  targetId: string;

  @Column({ name: 'reported_reason', type: 'varchar', length: 100 })
  reported_reason: string;

  @Column({ name: 'title', type: 'varchar', length: 555 })
  title: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string | null;

  @Column({
    name: 'attached_image_urls',
    type: 'text',
    array: true,
    default: [],
  })
  attachedImageUrls: string[];

  @Column({ name: 'status', type: 'varchar', length: 50 })
  status: ReportStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdById: string;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: AccountEntity;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ name: 'last_updated_by', type: 'uuid', nullable: true })
  lastUpdatedById?: string | null;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  @JoinColumn({ name: 'last_updated_by' })
  lastUpdatedBy?: AccountEntity | null;

  //#region development relations for easy fetching
  @ManyToOne(() => ReportReasonEntity, (reportedReason) => reportedReason.key, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'reported_reason' })
  reportedReasonEntity: ReportReasonEntity;

  @ManyToOne(() => PostEntity, (post) => post.postId, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  @JoinColumn({ name: 'target_id' })
  referencedTargetPost?: PostEntity | null;

  @ManyToOne(() => EventEntity, (event) => event.id, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  @JoinColumn({ name: 'target_id' })
  referencedTargetEvent?: EventEntity | null;

  @ManyToOne(() => LocationEntity, (location) => location.id, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  @JoinColumn({ name: 'target_id' })
  referencedTargetLocation?: LocationEntity | null;
  //#endregion
}
