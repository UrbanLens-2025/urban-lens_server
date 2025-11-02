import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsPositive, IsUUID } from 'class-validator';
import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class TransferFundsDto extends CoreActionDto {
  // transient fields
  ownerId: string;
  destinationWalletId: string;

  // request body
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  sourceWalletId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsPositive()
  amountToTransfer: number;

  @ApiProperty({ enum: SupportedCurrency })
  @IsNotEmpty()
  @IsEnum(SupportedCurrency)
  currency: SupportedCurrency;
}
