import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { Transform } from 'class-transformer';

export class InitiateTransferFromEscrowToAccountDto extends CoreActionDto {
  @Transform(({ value }) => Number(value))
  amount: number;
  currency: SupportedCurrency;
  destinationAccountId: string;
  note?: string;
}
