import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { WalletTransactionInitType } from '@/common/constants/WalletTransactionInitType.constant';
import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { Transform } from 'class-transformer';

export class InitiateTransferFromEscrowToSystemDto extends CoreActionDto {
  @Transform(({ value }) => Number(value))
  amount: number;
  currency: SupportedCurrency;
  note?: string;

  referencedInitType?: WalletTransactionInitType;
  referencedInitId?: string;
}
