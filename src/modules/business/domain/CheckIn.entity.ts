import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LocationEntity } from './Location.entity';

@Entity('check_ins')
export class CheckInEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ name: 'user_profile_id' })
  userProfileId: string;

  @ManyToOne(() => UserProfileEntity, (profile) => profile.checkIns, {
    createForeignKeyConstraints: true,
  })
  @JoinColumn({ name: 'user_profile_id' })
  userProfile: UserProfileEntity;

  @Column({ name: 'location_id' })
  locationId: string;

  @ManyToOne(() => LocationEntity, (location) => location.checkIns, {
    createForeignKeyConstraints: true,
  })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;

  @Column({ name: 'latitude_at_check_in', type: 'double precision' })
  latitudeAtCheckIn: number;

  @Column({ name: 'longitude_at_check_in', type: 'double precision' })
  longitudeAtCheckIn: number;
}
