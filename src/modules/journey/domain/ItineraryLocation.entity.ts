import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ItineraryEntity } from './Itinerary.entity';
import { LocationEntity } from '@/modules/business/domain/Location.entity';

@Entity({ name: 'itinerary_location', schema: 'development' })
export class ItineraryLocationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'itinerary_id', type: 'uuid' })
  itineraryId: string;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @Column({ name: 'order', type: 'integer' })
  order: number;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  @Column({
    name: 'travel_distance_km',
    type: 'double precision',
    nullable: true,
  })
  travelDistanceKm?: number;

  @Column({ name: 'travel_duration_minutes', type: 'integer', nullable: true })
  travelDurationMinutes?: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => ItineraryEntity, (itinerary) => itinerary.locations, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'itinerary_id' })
  itinerary: ItineraryEntity;

  @ManyToOne(() => LocationEntity, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;
}
