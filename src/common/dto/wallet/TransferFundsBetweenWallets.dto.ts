import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { IsEnum, IsNotEmpty, IsPositive, IsUUID } from 'class-validator';
import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class TransferFundsBetweenWalletsDto extends CoreActionDto {
  @IsNotEmpty()
  @IsUUID()
  fromWalletId: string;

  @IsNotEmpty()
  @IsUUID()
  toWalletId: string;

  @IsPositive()
  @IsNotEmpty()
  amount: number;

  @IsEnum(SupportedCurrency)
  @IsNotEmpty()
  currency: SupportedCurrency;
}
