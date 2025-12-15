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
    createForeignKeyConstraints: true,
  })
  @JoinColumn({ name: 'source_wallet_id' })
  sourceWallet: WalletEntity;

  @Column({ name: 'source_wallet_id', type: 'uuid' })
  sourceWalletId: string;

  @ManyToOne(() => WalletEntity, (wallet) => wallet.destinationTransactions, {
    createForeignKeyConstraints: true,
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

  @Column({
    name: 'note',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  note?: string | null;

  public startTransfer(destinationWalletId?: string): WalletTransactionEntity {
    this.destinationWalletId = destinationWalletId ?? this.destinationWalletId;
    if (!this.destinationWalletId) {
      throw new Error(
        'Destination wallet ID must be provided to start transfer.',
      );
    }

    switch (this.destinationWalletId) {
      case DefaultSystemWallet.ESCROW.toString(): {
        console.debug('Starting transfer to escrow');
        this.type = WalletTransactionType.TO_ESCROW;
        this.status = WalletTransactionStatus.PENDING;
        return this;
      }
      case DefaultSystemWallet.REVENUE.toString(): {
        console.debug('Starting transfer to revenue');
        this.type = WalletTransactionType.TO_REVENUE;
        this.status = WalletTransactionStatus.PENDING;
        return this;
      }
      default: {
        console.debug('Starting transfer to wallet');
        this.type = WalletTransactionType.TO_WALLET;
        this.status = WalletTransactionStatus.PENDING;
        return this;
      }
    }
  }

  public confirmTransfer(): WalletTransactionEntity {
    this.status = WalletTransactionStatus.COMPLETED;
    return this;
  }
}
