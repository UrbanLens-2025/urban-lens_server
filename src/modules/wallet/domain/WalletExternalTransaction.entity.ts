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
import { WalletExternalTransactionDirection } from '@/common/constants/WalletExternalTransactionDirection.constant';
import { WalletExternalTransactionStatus } from '@/common/constants/WalletExternalTransactionStatus.constant';
import { WalletExternalTransactionTimelineEntity } from '@/modules/wallet/domain/WalletExternalTransactionTimeline.entity';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { SupportedPaymentProviders } from '@/common/constants/SupportedPaymentProviders.constant';

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

  @Column({ name: 'provider', type: 'varchar', length: 50, nullable: true })
  provider: string | null;

  @Column({
    name: 'provider_transaction_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  providerTransactionId: string | null;

  @Column({ name: 'direction', type: 'varchar', length: 10 })
  direction: WalletExternalTransactionDirection;

  @Column({ name: 'amount', type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'currency', type: 'varchar', length: 3 })
  currency: SupportedCurrency;

  @Column({ name: 'payment_url', type: 'text', nullable: true })
  paymentUrl: string | null;

  @Column({
    name: 'expires_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  expiresAt: Date | null;

  @Column({ name: 'provider_response', type: 'jsonb', nullable: true })
  providerResponse: Record<string, any> | null;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: WalletExternalTransactionStatus.PENDING,
  })
  status: WalletExternalTransactionStatus;

  @Column({ name: 'created_by', type: 'uuid' })
  createdById: string;

  @OneToMany(
    () => WalletExternalTransactionTimelineEntity,
    (timeline) => timeline.transaction,
    {
      createForeignKeyConstraints: false,
    },
  )
  timeline: WalletExternalTransactionTimelineEntity[];

  public static createDepositTransaction(dto: {
    amount: number;
    walletId: string;
    createdById: string;
    currency: SupportedCurrency;
  }): WalletExternalTransactionEntity {
    const externalTransaction = new WalletExternalTransactionEntity();
    externalTransaction.amount = dto.amount;
    externalTransaction.walletId = dto.walletId;
    externalTransaction.createdById = dto.createdById;
    externalTransaction.currency = dto.currency;

    externalTransaction.direction = WalletExternalTransactionDirection.DEPOSIT;
    externalTransaction.status = WalletExternalTransactionStatus.PENDING;

    return externalTransaction;
  }

  public addPayment(dto: {
    paymentUrl: string;
    expiresAt: Date;
    provider: SupportedPaymentProviders;
  }) {
    this.paymentUrl = dto.paymentUrl;
    this.expiresAt = dto.expiresAt;
    this.provider = dto.provider;
    this.status = WalletExternalTransactionStatus.READY_FOR_PAYMENT;
    return this;
  }

  public confirmPayment(dto: {
    providerTransactionId: string;
    providerResponse: Record<string, any>;
  }) {
    this.providerTransactionId = dto.providerTransactionId;
    this.providerResponse = dto.providerResponse;

    this.status = WalletExternalTransactionStatus.COMPLETED;
    return this;
  }
}
