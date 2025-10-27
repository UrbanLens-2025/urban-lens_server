import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';
import {
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Entity,
} from 'typeorm';
import { LocationMissionEntity } from './LocationMission.entity';

@Entity({ name: UserMissionProgressEntity.TABLE_NAME })
export class UserMissionProgressEntity {
  public static readonly TABLE_NAME = 'user_mission_progresses';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserProfileEntity, {
    createForeignKeyConstraints: false,
    nullable: false,
  })
  @JoinColumn({ name: 'user_profile_id' })
  userProfile: UserProfileEntity;

  @Column({ name: 'user_profile_id' })
  userProfileId: string;

  @ManyToOne(() => LocationMissionEntity, {
    createForeignKeyConstraints: false,
    nullable: false,
  })
  @JoinColumn({ name: 'mission_id' })
  mission: LocationMissionEntity;

  @Column({ name: 'mission_id' })
  missionId: string;

  @Column({ name: 'progress' })
  progress: number;

  @Column({ name: 'completed' })
  completed: boolean;
}
