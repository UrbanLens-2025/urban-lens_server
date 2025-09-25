import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountEntity } from '@/modules/auth/domain/Account.entity';
import { TagEntity } from '@/modules/account/domain/Tag.entity';

@Entity('user_tags')
export class UserTagsEntity {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @ManyToOne(() => AccountEntity, (account) => account.id, {})
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;

  @Column({ name: 'account_id' })
  accountId: string;

  @ManyToOne(() => TagEntity, (tag) => tag.id, {})
  @JoinColumn({ name: 'tag_id' })
  tag: TagEntity;

  @Column({ name: 'tag_id' })
  tagId: number;
}
