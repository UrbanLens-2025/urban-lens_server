import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TagEntity } from '@/modules/utility/domain/Tag.entity';
import { LocationEntity } from '@/modules/business/domain/Location.entity';

@Entity({ name: LocationTagsEntity.TABLE_NAME })
export class LocationTagsEntity {
  public static readonly TABLE_NAME = 'location_tags';

  @PrimaryGeneratedColumn('identity')
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  deletedAt: Date | null;

  @ManyToOne(() => LocationEntity, (location) => location.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @ManyToOne(() => TagEntity, (tag) => tag.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'tag_id' })
  tag: TagEntity;

  @Column({ name: 'tag_id', type: 'integer' })
  tagId: number;
}
