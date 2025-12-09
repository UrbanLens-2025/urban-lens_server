import { DEFAULT_SYSTEM_CONFIG_VALUES, SystemConfigKey } from '@/common/constants/SystemConfigKey.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: SystemConfigEntity.TABLE_NAME })
export class SystemConfigEntity {
  public static readonly TABLE_NAME = 'system_config';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column({ name: 'key', type: 'varchar', length: 255 })
  key: SystemConfigKey;

  // should be manually parsed and serialized
  @Column({ name: 'value', type: 'text' })
  value: string;

  constructor(key: SystemConfigKey) {
    this.key = key;
    this.value = String(DEFAULT_SYSTEM_CONFIG_VALUES[key]);
  }
}
