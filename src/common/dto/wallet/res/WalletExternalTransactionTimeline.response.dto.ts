import { Expose, Type } from 'class-transformer';
import { WalletExternalTransactionStatus } from '@/common/constants/WalletExternalTransactionStatus.constant';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';

export class WalletExternalTransactionTimelineResponseDto {
  @Expose()
  id: string;

  @Expose()
  transactionId: string;

  @Expose()
  status: WalletExternalTransactionStatus;

  @Expose()
  note: string | null;

  @Expose()
  createdById: string;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => AccountResponseDto)
  createdBy?: AccountResponseDto;
}
