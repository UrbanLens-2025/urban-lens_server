import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { CreatorTypes } from '@/common/constants/CreatorType.constant';
import { SocialLink } from '@/common/json/SocialLink.json';
import { AccountEntity } from '@/modules/account/domain/Account.entity';

@Entity('creator-profile')
export class CreatorProfileEntity {
  @PrimaryColumn({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @OneToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity;

  @Column({ name: 'display_name', type: 'varchar', length: 555 })
  displayName: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'phone', type: 'varchar', length: 255 })
  phoneNumber: string;

  @Column({ name: 'avatar_url', type: 'varchar', length: 2048 })
  avatarUrl: string;

  @Column({ name: 'cover_url', type: 'varchar', length: 2048 })
  coverUrl: string;

  @Column({ name: 'type', type: 'varchar', length: 100 })
  type: CreatorTypes;

  @Column({ name: 'social', type: 'jsonb', nullable: true })
  social: SocialLink[];
}
