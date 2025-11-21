import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LocationRequestEntity } from '@/modules/business/domain/LocationRequest.entity';
import { TagEntity } from '@/modules/utility/domain/Tag.entity';

@Entity({ name: LocationRequestTagsEntity.TABLE_NAME })
export class LocationRequestTagsEntity {
  public static readonly TABLE_NAME = 'location_request_tags';

  @PrimaryGeneratedColumn('identity')
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(
    () => LocationRequestEntity,
    (locationRequest) => locationRequest.id,
    {
      createForeignKeyConstraints: false,
    },
  )
  @JoinColumn({ name: 'location_request_id' })
  locationRequest: LocationRequestEntity;

  @Column({ name: 'location_request_id', type: 'uuid' })
  locationRequestId: string;

  @ManyToOne(() => TagEntity, (tag) => tag.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'tag_id' })
  tag: TagEntity;

  @Column({ name: 'tag_id', type: 'integer' })
  tagId: number;
}
