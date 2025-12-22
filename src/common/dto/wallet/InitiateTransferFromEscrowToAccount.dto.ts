import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { TransactionCategory } from '@/common/constants/TransactionCategory.constant';
import { WalletTransactionInitType } from '@/common/constants/WalletTransactionInitType.constant';
import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { Transform } from 'class-transformer';

export class InitiateTransferFromEscrowToAccountDto extends CoreActionDto {
  @Transform(({ value }) => Number(value))
  amount: number;
  currency: SupportedCurrency;
  destinationAccountId: string;
  note?: string;
  referencedInitType?: WalletTransactionInitType;
  transactionCategory?: TransactionCategory | null;
  referencedInitId?: string;
}
