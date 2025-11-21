import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventRequestEntity } from '@/modules/event/domain/EventRequest.entity';
import { TagEntity } from '@/modules/utility/domain/Tag.entity';

@Entity({ name: EventRequestTagsEntity.TABLE_NAME })
export class EventRequestTagsEntity {
  public static readonly TABLE_NAME = 'event_request_tags';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => EventRequestEntity, (event) => event.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'event_request_id' })
  eventRequest: EventRequestEntity;

  @Column({ name: 'event_request_id', type: 'uuid' })
  eventRequestId: string;

  @ManyToOne(() => TagEntity, (tag) => tag.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'tag_id' })
  tag: TagEntity;

  @Column({ name: 'tag_id', type: 'int' })
  tagId: number;
}
