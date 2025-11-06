import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { WalletTransactionEntity } from '@/modules/wallet/domain/WalletTransaction.entity';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { EventTicketOrderStatus } from '@/common/constants/EventTicketOrderStatus.constant';
import { TicketOrderDetailsEntity } from '@/modules/event/domain/TicketOrderDetails.entity';
import { EventEntity } from '@/modules/event/domain/Event.entity';

@Entity({ name: TicketOrderEntity.TABLE_NAME })
export class TicketOrderEntity {
  public static readonly TABLE_NAME = 'event_ticket_orders';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_number', type: 'varchar', length: 100 })
  orderNumber: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: AccountEntity;

  @Column({ name: 'created_by_id', type: 'uuid' })
  createdById: string;

  @Column({
    name: 'total_payment_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  totalPaymentAmount: number;

  @Column({ name: 'currency', type: 'varchar', length: 3 })
  currency: SupportedCurrency;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: EventTicketOrderStatus.PENDING,
  })
  status: EventTicketOrderStatus;

  @ManyToOne(() => WalletTransactionEntity, (transaction) => transaction.id, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  @JoinColumn({ name: 'referenced_transaction_id' })
  referencedTransaction: WalletTransactionEntity;

  @Column({ name: 'referenced_transaction_id', type: 'uuid', nullable: true })
  referencedTransactionId: string | null;

  @ManyToOne(() => EventEntity, (event) => event.id, {
    createForeignKeyConstraints: false,
  })
  event: EventEntity;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  //

  @OneToMany(() => TicketOrderDetailsEntity, (detail) => detail.order, {
    createForeignKeyConstraints: false,
    cascade: ['insert', 'soft-remove'],
  })
  orderDetails: TicketOrderDetailsEntity[];

  @BeforeInsert()
  generateOrderNumber() {
    const timestamp = Date.now().toString();
    const createdById = this.createdById.slice(0, 8).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    this.orderNumber = `TO-${timestamp}-${createdById}${randomSuffix}`;
  }
}
