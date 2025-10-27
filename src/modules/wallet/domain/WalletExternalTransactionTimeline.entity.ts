import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WalletExternalTransactionEntity } from '@/modules/wallet/domain/WalletExternalTransaction.entity';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { WalletExternalTransactionStatus } from '@/common/constants/WalletExternalTransactionStatus.constant';

@Entity({ name: WalletExternalTransactionTimelineEntity.TABLE_NAME })
export class WalletExternalTransactionTimelineEntity {
  public static readonly TABLE_NAME = 'wallet_external_transaction_timeline';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(
    () => WalletExternalTransactionEntity,
    (transaction) => transaction.timeline,
    {
      createForeignKeyConstraints: false,
    },
  )
  @JoinColumn({ name: 'transaction_id' })
  transaction: WalletExternalTransactionEntity;

  @Column({ name: 'transaction_id', type: 'uuid' })
  transactionId: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
  })
  status: WalletExternalTransactionStatus;

  @Column({ name: 'note', type: 'text', nullable: true })
  note: string | null;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: AccountEntity;

  @Column({ name: 'created_by', type: 'uuid' })
  createdById: string;
}
