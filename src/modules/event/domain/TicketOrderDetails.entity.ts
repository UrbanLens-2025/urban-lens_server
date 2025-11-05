import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { EventTicketEntity } from '@/modules/event/domain/EventTicket.entity';
import { TicketOrderEntity } from '@/modules/event/domain/TicketOrder.entity';

@Entity({
  name: TicketOrderDetailsEntity.TABLE_NAME,
})
export class TicketOrderDetailsEntity {
  public static readonly TABLE_NAME = 'event_ticket_order_details';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({
    name: 'unit_price',
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  unitPrice: number;

  @Column({ name: 'currency', type: 'varchar', length: 3 })
  currency: SupportedCurrency;

  @Column({
    name: 'sub_total',
    type: 'numeric',
    precision: 12,
    scale: 2,
  })
  subTotal: number;

  @ManyToOne(() => EventTicketEntity, (eventTicket) => eventTicket.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'event_ticket_id' })
  ticket: EventTicketEntity;

  @Column({ name: 'event_ticket_id', type: 'uuid' })
  ticketId: string;

  @ManyToOne(() => TicketOrderEntity, (order) => order.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'ticket_order_id' })
  order: TicketOrderEntity;

  @Column({ name: 'ticket_order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'ticket_snapshot', type: 'jsonb' })
  ticketSnapshot: EventTicketEntity;
}
