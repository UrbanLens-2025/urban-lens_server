import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TagGroup } from '@/common/constants/TagGroup.constant';

@Entity('tag')
export class TagEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone' })
  deletedAt: Date;

  @Column({
    name: 'group_name',
    type: 'varchar',
    length: 100,
    default: TagGroup.USER_TYPE,
  })
  groupName: TagGroup;

  @Column({ name: 'display_name', type: 'varchar', length: 255 })
  displayName: string;

  @Column({ name: 'display_name_normalized', type: 'varchar', length: 255 })
  displayNameNormalized: string; // for case-insensitive search

  @Column({ name: 'color', type: 'varchar', length: 50 })
  color: string;

  @Column({ name: 'icon', type: 'varchar', length: 10 })
  icon: string;

  @Column({ name: 'is_selectable', type: 'boolean', default: true })
  isSelectable: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  normalizeDisplayName() {
    if (this.displayName) {
      this.displayNameNormalized = this.displayName.trim().toLowerCase();
    }
  }
}
