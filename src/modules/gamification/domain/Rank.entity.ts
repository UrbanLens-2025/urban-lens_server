import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';

export enum RankName {
  NEW_EXPLORER = 'new_explorer',
  LOCAL_GUIDE = 'local_guide',
  ADVENTURER = 'adventurer',
  EXPLORER_PRO = 'explorer_pro',
  HALL_OF_FAME = 'hall_of_fame',
}

@Entity({ name: 'ranks' })
export class RankEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 50, nullable: false })
  name: RankName;

  @Column({ name: 'min_points', type: 'int', nullable: false })
  minPoints: number;

  @Column({ name: 'max_points', type: 'int', nullable: true })
  maxPoints: number;

  @Column({ name: 'icon', type: 'varchar', length: 255, nullable: true })
  icon: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => UserProfileEntity, (userProfile) => userProfile.rankEntity, {
    createForeignKeyConstraints: true,
  })
  userProfiles: UserProfileEntity[];
}
