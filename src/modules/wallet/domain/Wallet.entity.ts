import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { WalletTransactionEntity } from '@/modules/wallet/domain/WalletTransaction.entity';
import { WalletExternalTransactionEntity } from '@/modules/wallet/domain/WalletExternalTransaction.entity';
import { WalletType } from '@/common/constants/WalletType.constant';

@Entity({ name: WalletEntity.TABLE_NAME })
export class WalletEntity {
  public static readonly TABLE_NAME = 'wallets';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owned_by', type: 'uuid', nullable: true })
  ownedBy: string | null;

  @OneToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'owned_by' })
  owner: AccountEntity;

  @Column({
    name: 'wallet_type',
    type: 'varchar',
    length: 20,
    default: WalletType.USER,
  })
  walletType: WalletType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({
    name: 'balance',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  balance: number;

  @Column({
    name: 'locked_balance',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  lockedBalance: number;

  @Column({ name: 'currency', type: 'varchar', length: 3 })
  currency: SupportedCurrency;

  @Column({ name: 'total_transactions', type: 'int', default: 0 })
  totalTransactions: number;

  @Column({ name: 'is_locked', type: 'boolean', default: false })
  isLocked: boolean;

  @Column({ name: 'created_by', type: 'uuid' })
  createdById: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedById: string | null;

  @OneToMany(
    () => WalletTransactionEntity,
    (transaction) => transaction.sourceWallet,
    {
      createForeignKeyConstraints: false,
    },
  )
  sourceTransactions: WalletTransactionEntity[];

  @OneToMany(
    () => WalletTransactionEntity,
    (transaction) => transaction.destinationWallet,
    {
      createForeignKeyConstraints: false,
    },
  )
  destinationTransactions: WalletTransactionEntity[];

  @OneToMany(
    () => WalletExternalTransactionEntity,
    (transaction) => transaction.wallet,
    {
      createForeignKeyConstraints: false,
    },
  )
  externalTransactions: WalletExternalTransactionEntity[];

  public canUpdateBalance(): boolean {
    return !this.isLocked;
  }

  public static createDefault(ownedBy: string): WalletEntity {
    const wallet = new WalletEntity();
    wallet.ownedBy = ownedBy;
    wallet.walletType = WalletType.USER;
    wallet.currency = SupportedCurrency.VND;
    wallet.balance = 0;
    wallet.totalTransactions = 0;
    wallet.createdById = ownedBy;
    return wallet;
  }
}
