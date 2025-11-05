import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TicketOrderEntity } from '@/modules/event/domain/TicketOrder.entity';
import { EventAttendanceStatus } from '@/common/constants/EventAttendanceStatus.constant';

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
  order: TicketOrderEntity;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'status', type: 'varchar', length: 20 })
  status: EventAttendanceStatus;
}
