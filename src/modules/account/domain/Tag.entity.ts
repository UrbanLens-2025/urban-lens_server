import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, JoinTable, ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tag')
export class TagEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @Column({ name: 'display_name', type: 'varchar', length: 255 })
  displayName: string;

  @Column({ name: 'color', type: 'varchar', length: 50 })
  color: string;

  @Column({ name: 'icon', type: 'varchar', length: 10 })
  icon: string;
}
