import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { WalletTransactionEntity } from '@/modules/wallet/domain/WalletTransaction.entity';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';

@Entity({ name: LocationBookingEntity.TABLE_NAME })
export class LocationBookingEntity {
  public static readonly TABLE_NAME = 'location_bookings';

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => AccountEntity, (account) => account.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'account_id' })
  createdBy: AccountEntity;

  @Column({ name: 'account_id', type: 'uuid' })
  createdById: string;

  @ManyToOne(() => LocationEntity, (location) => location.id, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'location_id' })
  location: LocationEntity;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @Column({ name: 'start_date_time', type: 'timestamp with time zone' })
  startDateTime: Date;

  @Column({ name: 'end_date_time', type: 'timestamp with time zone' })
  endDateTime: Date;

  @Column({ name: 'status', type: 'varchar', length: 55 })
  status: LocationBookingStatus;

  @Column({ name: 'amount_to_pay', type: 'numeric' })
  amountToPay: number;

  @Column({ name: 'referenced_transaction_id', type: 'uuid' })
  referencedTransactionId: string;

  @ManyToOne(
    () => WalletTransactionEntity,
    (walletTransaction) => walletTransaction.id,
    {
      createForeignKeyConstraints: false,
    },
  )
  @JoinColumn({ name: 'referenced_transaction_id' })
  referencedTransaction: WalletTransactionEntity;
}
