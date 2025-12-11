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
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { TicketOrderDetailsEntity } from '@/modules/event/domain/TicketOrderDetails.entity';
import dayjs from 'dayjs';

@Entity({ name: 'event_ticket' })
export class EventTicketEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: AccountEntity;

  @Column({ name: 'created_by', type: 'uuid' })
  createdById: string;

  @Column({ name: 'display_name', type: 'varchar', length: 255 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'char', length: 3, default: 'USD' })
  currency: string;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  tos: string;

  // total quantity of the ticket`
  @Column({ name: 'total_quantity', type: 'int', default: 0 })
  totalQuantity: number;

  // total quantity for sale
  @Column({ name: 'total_quantity_available', type: 'int', default: 0 })
  totalQuantityAvailable: number;

  // total quantity sold
  @Column({ name: 'quantity_reserved', type: 'int', default: 0 })
  quantityReserved: number;

  @Column({ name: 'sale_start_date', type: 'timestamp with time zone' })
  saleStartDate: Date;

  @Column({ name: 'sale_end_date', type: 'timestamp with time zone' })
  saleEndDate: Date;

  @Column({ name: 'min_quantity_per_order', type: 'int', default: 1 })
  minQuantityPerOrder: number;

  @Column({ name: 'max_quantity_per_order', type: 'int', default: 5 })
  maxQuantityPerOrder: number;

  @ManyToOne(() => EventEntity, (event) => event.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'event_id' })
  event: EventEntity;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  //#region refunds

  @Column({ name: 'allow_refunds', type: 'boolean', default: false })
  allowRefunds: boolean;

  @Column({
    name: 'refund_percentage_before_cutoff',
    type: 'numeric',
    precision: 3,
    scale: 2,
    nullable: true,
  })
  refundPercentageBeforeCutoff?: number | null;

  @Column({
    name: 'refund_cutoff_hours_after_payment',
    type: 'int',
    nullable: true,
  })
  refundCutoffHoursAfterPayment?: number | null;

  //#endregion

  @OneToMany(() => TicketOrderDetailsEntity, (detail) => detail.ticket, {
    createForeignKeyConstraints: false,
  })
  ticketOrderDetails: TicketOrderDetailsEntity[];

  public canBePurchasedNow(): boolean {
    const now = new Date();
    return (
      this.isActive &&
      now >= this.saleStartDate &&
      now <= this.saleEndDate &&
      this.totalQuantityAvailable > 0
    );
  }

  public getRefundPercentage(purchaseDate: Date): false | number {
    if (
      !this.allowRefunds ||
      !this.refundCutoffHoursAfterPayment ||
      !this.refundPercentageBeforeCutoff
    ) {
      return false;
    }

    const now = dayjs();

    const differenceInHours = now.diff(dayjs(purchaseDate), 'hour');

    if (differenceInHours <= this.refundCutoffHoursAfterPayment) {
      return this.refundPercentageBeforeCutoff;
    }

    return false; // after cutoff, no refund
  }
}
