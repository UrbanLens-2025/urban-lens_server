import { AccountEntity } from '@/modules/account/domain/Account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: AccountWarningEntity.TABLE_NAME })
export class AccountWarningEntity {
  public static readonly TABLE_NAME = 'account_warning';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: true,
    nullable: true,
  })
  @JoinColumn({ name: 'created_by' })
  createdBy?: AccountEntity | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdById?: string | null;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: true,
  })
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ name: 'warning_note', type: 'varchar', length: 555 })
  warningNote: string;
}
