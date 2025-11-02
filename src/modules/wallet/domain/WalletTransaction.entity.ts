import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WalletEntity } from '@/modules/wallet/domain/Wallet.entity';
import { WalletTransactionStatus } from '@/common/constants/WalletTransactionStatus.constant';
import { WalletTransactionType } from '@/common/constants/WalletTransactionType.constant';
import { DefaultSystemWallet } from '@/common/constants/DefaultSystemWallet.constant';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';

@Entity({ name: WalletTransactionEntity.TABLE_NAME })
export class WalletTransactionEntity {
  public static readonly TABLE_NAME = 'wallet_transactions';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.sourceTransactions, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'source_wallet_id' })
  sourceWallet: WalletEntity;

  @Column({ name: 'source_wallet_id', type: 'uuid' })
  sourceWalletId: string;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.destinationTransactions, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'destination_wallet_id' })
  destinationWallet: WalletEntity;

  @Column({ name: 'destination_wallet_id', type: 'uuid' })
  destinationWalletId: string;

  @Column({ name: 'amount', type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'currency', type: 'varchar', length: 3 })
  currency: SupportedCurrency;

  @Column({ name: 'type', type: 'varchar', length: 55 })
  type: WalletTransactionType;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: WalletTransactionStatus.PENDING,
  })
  status: WalletTransactionStatus;

  public startTransferToEscrow(): WalletTransactionEntity {
    this.destinationWalletId = DefaultSystemWallet.ESCROW;
    this.type = WalletTransactionType.TO_ESCROW;
    this.status = WalletTransactionStatus.PENDING;
    return this;
  }

  public startTransferToRevenue(): WalletTransactionEntity {
    this.destinationWalletId = DefaultSystemWallet.REVENUE;
    this.type = WalletTransactionType.TO_REVENUE;
    this.status = WalletTransactionStatus.PENDING;
    return this;
  }

  public confirmTransfer(): WalletTransactionEntity {
    this.status = WalletTransactionStatus.COMPLETED;
    return this;
  }
}
