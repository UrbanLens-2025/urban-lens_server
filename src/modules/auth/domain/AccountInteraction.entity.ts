import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

enum ActionType {
  LIKE = 'like',
  COMMENT = 'comment',
  SHARE = 'share',
}

@Entity({ name: 'account_interactions' })
export class AccountInteractionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({
    name: 'interaction_type',
    type: 'enum',
    enum: ActionType,
  })
  interactionType: ActionType;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  reviewId: string;

  @Column({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
