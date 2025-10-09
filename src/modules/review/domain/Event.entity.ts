import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'events' })
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  eventId: string;

  @Column({ name: 'event_name', type: 'string' })
  eventName: string;

  @Column({ name: 'event_description', type: 'text' })
  eventDescription: string;

  @Column({ name: 'event_date', type: 'timestamp' })
  eventDate: Date;
}
