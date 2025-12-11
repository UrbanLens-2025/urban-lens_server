import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TicketOrderEntity } from '@/modules/event/domain/TicketOrder.entity';
import { EventAttendanceStatus } from '@/common/constants/EventAttendanceStatus.constant';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { EventTicketEntity } from '@/modules/event/domain/EventTicket.entity';
import { WalletTransactionEntity } from '@/modules/wallet/domain/WalletTransaction.entity';

@Entity({ name: EventAttendanceEntity.TABLE_NAME })
export class EventAttendanceEntity {
  public static readonly TABLE_NAME = 'event_attendance';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => TicketOrderEntity, (order) => order.id, {
    nullable: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'order_id' })
  order: TicketOrderEntity;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => EventEntity, (event) => event.id, {
    nullable: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  status: EventAttendanceStatus;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'owner_id' })
  owner?: AccountEntity | null;

  @Column({ name: 'owner_id', type: 'uuid', nullable: true })
  ownerId?: string | null;

  @Column({ name: 'owner_email', type: 'varchar', length: 255, nullable: true })
  ownerEmail?: string | null;

  @Column({
    name: 'owner_phone_number',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  ownerPhoneNumber?: string | null;

  @Column({ name: 'number_of_attendees', type: 'int', default: 1 })
  numberOfAttendees: number;

  @ManyToOne(() => TicketOrderEntity, (order) => order.id, {
    nullable: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'referenced_ticket_order_id' })
  referencedTicketOrder: TicketOrderEntity;

  @Column({ name: 'referenced_ticket_order_id', type: 'uuid' })
  referencedTicketOrderId: string;

  @ManyToOne(() => EventTicketEntity, (ticket) => ticket.id, {
    nullable: false,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket: EventTicketEntity;

  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId: string;

  @Column({
    name: 'checked_in_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  checkedInAt?: Date | null;

  @Column({
    name: 'refunded_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  refundedAt?: Date | null;

  @Column({ name: 'ticket_snapshot', type: 'jsonb', default: {} })
  ticketSnapshot: EventTicketEntity;

  @Column({ name: 'refund_transaction_id', type: 'uuid', nullable: true })
  refundTransactionId?: string | null;

  @ManyToOne(() => WalletTransactionEntity, (transaction) => transaction.id, {
    nullable: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'refund_transaction_id' })
  refundTransaction?: WalletTransactionEntity | null;

  @Column({
    name: 'refunded_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  refundedAmount?: number | null;

  public canCheckIn(): boolean {
    return this.status === EventAttendanceStatus.CREATED;
  }

  canBeRefunded() {
    return (
      this.status === EventAttendanceStatus.CREATED &&
      !this.checkedInAt &&
      !this.refundedAt &&
      !this.refundTransactionId
    ); // can only refund if not checked in and not already refunded
  }
}
