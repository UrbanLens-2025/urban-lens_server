import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsPositive } from 'class-validator';
import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { DefaultSystemWallet } from '@/common/constants/DefaultSystemWallet.constant';

export class TransferFundsFromSystemWalletDto extends CoreActionDto {
  // transient fields
  destinationWalletId: string;
  note?: string;

  // request body
  @ApiProperty({ enum: DefaultSystemWallet })
  @IsEnum([DefaultSystemWallet.ESCROW, DefaultSystemWallet.REVENUE])
  @IsNotEmpty()
  sourceWalletId: DefaultSystemWallet;

  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  amountToTransfer: number;

  @ApiProperty({ enum: SupportedCurrency })
  @IsNotEmpty()
  @IsEnum(SupportedCurrency)
  currency: SupportedCurrency;
}
