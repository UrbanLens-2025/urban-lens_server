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
import { WalletEntity } from '@/modules/wallet/domain/Wallet.entity';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { WalletExternalTransactionDirection } from '@/common/constants/WalletExternalTransactionDirection.constant';
import { WalletExternalTransactionStatus } from '@/common/constants/WalletExternalTransactionStatus.constant';
import { WalletExternalTransactionTimelineEntity } from '@/modules/wallet/domain/WalletExternalTransactionTimeline.entity';

@Entity({ name: WalletExternalTransactionEntity.TABLE_NAME })
export class WalletExternalTransactionEntity {
  public static readonly TABLE_NAME = 'wallet_external_transactions';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.externalTransactions, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'wallet_id' })
  wallet: WalletEntity;

  @Column({ name: 'wallet_id', type: 'uuid' })
  walletId: string;

  @Column({ name: 'provider', type: 'varchar', length: 50 })
  provider: string;

  @Column({ name: 'provider_transaction_id', type: 'varchar', length: 255 })
  providerTransactionId: string;

  @Column({ name: 'direction', type: 'varchar', length: 10 })
  direction: WalletExternalTransactionDirection;

  @Column({ name: 'amount', type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'currency', type: 'varchar', length: 3 })
  currency: string;

  @Column({ name: 'provider_response', type: 'jsonb', nullable: true })
  providerResponse: Record<string, any> | null;

  @Column({ name: 'reference_code', type: 'varchar', length: 100, nullable: true })
  referenceCode: string | null;

  @Column({ name: 'status', type: 'varchar', length: 20, default: WalletExternalTransactionStatus.PENDING })
  status: WalletExternalTransactionStatus;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: AccountEntity | null;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedById: string | null;

  @Column({ name: 'approved_at', type: 'timestamp with time zone', nullable: true })
  approvedAt: Date | null;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  @JoinColumn({ name: 'rejected_by' })
  rejectedBy: AccountEntity | null;

  @Column({ name: 'rejected_by', type: 'uuid', nullable: true })
  rejectedById: string | null;

  @Column({ name: 'rejected_at', type: 'timestamp with time zone', nullable: true })
  rejectedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp with time zone', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string | null;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string | null;

  @Column({ name: 'created_by', type: 'uuid' })
  createdById: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedById: string | null;

  @OneToMany(() => WalletExternalTransactionTimelineEntity, (timeline) => timeline.transaction, {
    createForeignKeyConstraints: false,
  })
  timeline: WalletExternalTransactionTimelineEntity[];
}
