import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column({ name: 'group_name', type: 'varchar', length: 100, nullable: true })
  groupName: string;

  @Column({ name: 'display_name', type: 'varchar', length: 255 })
  displayName: string;

  @Column({ name: 'color', type: 'varchar', length: 50 })
  color: string;

  @Column({ name: 'icon', type: 'varchar', length: 10 })
  icon: string;

  @Column({ name: 'is_selectable', type: 'boolean', default: true })
  isSelectable: boolean;
}
