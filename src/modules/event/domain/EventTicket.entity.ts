import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { AccountEntity } from '@/modules/account/domain/Account.entity';

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

  @Column({ name: 'total_quantity', type: 'int', default: 0 })
  totalQuantity: number;

  @Column({ name: 'total_quantity_available', type: 'int', default: 0 })
  totalQuantityAvailable: number;

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

  public canBePurchasedNow(): boolean {
    const now = new Date();
    return (
      this.isActive && now >= this.saleStartDate && now <= this.saleEndDate
    );
  }
}
