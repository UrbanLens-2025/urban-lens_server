import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountEntity } from '@/modules/account/domain/Account.entity';

@Entity({ name: AccountSuspensionEntity.TABLE_NAME })
export class AccountSuspensionEntity {
  public static readonly TABLE_NAME = 'account_suspension';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: true,
  })
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ name: 'suspended_until', type: 'timestamp with time zone' })
  suspendedUntil: Date;

  @Column({ name: 'suspension_reason', type: 'varchar', length: 555 })
  suspensionReason: string;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: true,
    nullable: true,
  })
  @JoinColumn({ name: 'suspended_by' })
  suspendedBy?: AccountEntity | null;

  @Column({ name: 'suspended_by', type: 'uuid', nullable: true })
  suspendedById?: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
