import { ReportPenaltyActions } from '@/common/constants/ReportPenaltyActions.constant';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { ReportEntityType } from '@/modules/report/domain/Report.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'penalties' })
export class PenaltyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'target_id', type: 'uuid' })
  targetId: string;

  @Column({ name: 'target_type', type: 'varchar', length: 50 })
  targetType: ReportEntityType;

  @Column({ name: 'target_owner_id', type: 'uuid' })
  targetOwnerId: string;

  @Column({
    name: 'penalty_action',
    type: 'varchar',
    length: 50,
  })
  penaltyAction: ReportPenaltyActions;

  @Column({
    name: 'reason',
    type: 'varchar',
    length: 512,
    nullable: true,
  })
  reason?: string | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdById?: string | null;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: true,
    nullable: true,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy?: AccountEntity | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
