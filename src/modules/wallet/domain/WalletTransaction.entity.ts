import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WalletEntity } from '@/modules/wallet/domain/Wallet.entity';
import { WalletTransactionDirection } from '@/common/constants/WalletTransactionDirection.constant';
import { WalletTransactionType } from '@/common/constants/WalletTransactionType.constant';
import { WalletTransactionStatus } from '@/common/constants/WalletTransactionStatus.constant';

@Entity({ name: WalletTransactionEntity.TABLE_NAME })
export class WalletTransactionEntity {
  public static readonly TABLE_NAME = 'wallet_transactions';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.transactions, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'wallet_id' })
  wallet: WalletEntity;

  @Column({ name: 'wallet_id', type: 'uuid' })
  walletId: string;

  @Column({
    name: 'transaction_code',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  transactionCode: string;

  @Column({ name: 'amount', type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'currency', type: 'varchar', length: 3 })
  currency: string;

  @Column({ name: 'direction', type: 'varchar', length: 10 })
  direction: WalletTransactionDirection;

  @Column({ name: 'type', type: 'varchar', length: 20 })
  type: WalletTransactionType;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: WalletTransactionStatus.PENDING,
  })
  status: WalletTransactionStatus;
}
