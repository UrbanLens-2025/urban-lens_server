import { LocationEntity } from '@/modules/business/domain/Location.entity';
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

@Entity({ name: UserLocationProfileEntity.TABLE_NAME })
export class UserLocationProfileEntity {
  public static readonly TABLE_NAME = 'user_location_profiles';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LocationEntity, {
    createForeignKeyConstraints: false,
    nullable: false,
  })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;

  @Column({ name: 'location_id' })
  locationId: string;

  @ManyToOne(() => UserProfileEntity, {
    createForeignKeyConstraints: false,
    nullable: false,
  })
  @JoinColumn({ name: 'user_profile_id' })
  userProfile: UserProfileEntity;

  @Column({ name: 'user_profile_id' })
  userProfileId: string;

  @Column({ name: 'total_points' })
  totalPoints: number;

  @Column({ name: 'available_points' })
  availablePoints: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
