import { DEFAULT_SYSTEM_CONFIG_VALUES, SystemConfigKey } from '@/common/constants/SystemConfigKey.constant';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountEntity } from '@/modules/account/domain/Account.entity';

@Entity({ name: SystemConfigEntity.TABLE_NAME })
export class SystemConfigEntity {
  public static readonly TABLE_NAME = 'system_config';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
    nullable: true,
  })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: AccountEntity | null;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedById?: string | null;

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
