import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';
import {
  Column,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LocationMissionEntity } from './LocationMission.entity';

@Entity({ name: UserMissionProgressEntity.TABLE_NAME })
export class UserMissionProgressEntity {
  public static readonly TABLE_NAME = 'user_mission_progresses';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({
    name: 'completed_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  completedAt?: Date | null;

  @ManyToOne(() => UserProfileEntity, (userProfile) => userProfile.accountId, {
    createForeignKeyConstraints: true,
    nullable: false,
  })
  @JoinColumn({ name: 'user_profile_id' })
  userProfile: UserProfileEntity;

  @Column({ name: 'user_profile_id' })
  userProfileId: string;

  @ManyToOne(() => LocationMissionEntity, {
    createForeignKeyConstraints: true,
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
