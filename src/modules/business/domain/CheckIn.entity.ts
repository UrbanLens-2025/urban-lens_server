import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LocationEntity } from './Location.entity';

@Entity('check_ins')
export class CheckInEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_profile_id' })
  userProfileId: string;

  @ManyToOne(() => UserProfileEntity, (profile) => profile.checkIns)
  @JoinColumn({ name: 'user_profile_id' })
  userProfile: UserProfileEntity;

  @Column({ name: 'location_id' })
  locationId: string;

  @ManyToOne(() => LocationEntity, (location) => location.checkIns)
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;

  @Column({
    name: 'check_in_time',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  checkInTime: Date;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;
}
