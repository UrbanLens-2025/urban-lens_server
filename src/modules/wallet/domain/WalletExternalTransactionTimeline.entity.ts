import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WalletExternalTransactionEntity } from '@/modules/wallet/domain/WalletExternalTransaction.entity';
import { WalletExternalTransactionStatus } from '@/common/constants/WalletExternalTransactionStatus.constant';
import { WalletExternalTransactionAction } from '@/common/constants/WalletExternalTransactionAction.constant';
import { WalletExternalTransactionActor } from '@/common/constants/WalletExternalTransactionActor.constant';
import { AccountEntity } from '@/modules/account/domain/Account.entity';

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
    name: 'status_changed_to',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  statusChangedTo: WalletExternalTransactionStatus;

  @Column({ name: 'action', type: 'varchar', length: 100 })
  action: WalletExternalTransactionAction;

  @Column({
    name: 'actor_type',
    type: 'varchar',
    length: 20,
    default: WalletExternalTransactionActor.SYSTEM,
  })
  actorType: WalletExternalTransactionActor;

  @Column({ name: 'actor_id', type: 'uuid', nullable: true })
  actorId: string | null;

  @ManyToOne(() => AccountEntity, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'actor_id' })
  actor?: AccountEntity | null;

  @Column({ name: 'actor_name', type: 'varchar', length: 255 })
  actorName: string;

  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;
}
