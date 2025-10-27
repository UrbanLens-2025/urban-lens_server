import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserMissionProgressEntity } from './UserMissionProgress.entity';

@Entity({ name: LocationMissionLogEntity.TABLE_NAME })
export class LocationMissionLogEntity {
  public static readonly TABLE_NAME = 'location_mission_logs';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserMissionProgressEntity, {
    createForeignKeyConstraints: false,
    nullable: false,
  })
  @JoinColumn({ name: 'user_mission_progress_id' })
  userMissionProgress: UserMissionProgressEntity;

  @Column({ name: 'user_mission_progress_id' })
  userMissionProgressId: string;

  @Column({ name: 'image_urls', type: 'text', array: true, default: [] })
  imageUrls: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
