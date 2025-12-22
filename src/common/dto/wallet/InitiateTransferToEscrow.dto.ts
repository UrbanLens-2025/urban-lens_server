import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { Transform } from 'class-transformer';
import { WalletTransactionInitType } from '@/common/constants/WalletTransactionInitType.constant';
import { TransactionCategory } from '@/common/constants/TransactionCategory.constant';

export class InitiateTransferToEscrowDto extends CoreActionDto {
  fromAccountId: string; // get wallet from here
  accountName: string;

  @Transform(({ value }) => Number(value))
  amountToTransfer: number;
  currency: SupportedCurrency;

  transactionCategory?: TransactionCategory | null;
  referencedInitType?: WalletTransactionInitType;
  referencedInitId?: string;

  ipAddress: string;
  returnUrl: string;
  note?: string;
}
