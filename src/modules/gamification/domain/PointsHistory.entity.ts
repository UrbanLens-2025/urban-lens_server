import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PointsTransactionType {
  CHECK_IN = 'check_in',
  CREATE_BLOG = 'create_blog',
  CREATE_REVIEW = 'create_review',
  CREATE_COMMENT = 'create_comment',
  REDEEM = 'redeem', // Đổi thưởng (trừ điểm)
  ADMIN_ADJUSTMENT = 'admin_adjustment', // Admin điều chỉnh
}

@Entity({ name: 'points_history' })
export class PointsHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'points', type: 'integer' })
  points: number; // Số điểm (+/-), positive = cộng, negative = trừ

  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: PointsTransactionType,
  })
  transactionType: PointsTransactionType;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string; // Mô tả chi tiết

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string; // ID của post, comment, check-in, etc.

  @Column({ name: 'balance_before', type: 'integer' })
  balanceBefore: number; // Số điểm trước khi giao dịch

  @Column({ name: 'balance_after', type: 'integer' })
  balanceAfter: number; // Số điểm sau khi giao dịch

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
