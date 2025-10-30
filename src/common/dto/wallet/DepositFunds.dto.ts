import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { IsEnum, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class DepositFundsDto extends CoreActionDto {
  @IsNotEmpty()
  @IsUUID()
  walletId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(SupportedCurrency)
  @IsNotEmpty()
  currency: SupportedCurrency;
}
