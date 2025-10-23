import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUUID, IsEnum, Min } from 'class-validator';
import { WalletTransactionDirection } from '@/common/constants/WalletTransactionDirection.constant';
import { WalletTransactionType } from '@/common/constants/WalletTransactionType.constant';

export class CreateWalletTransactionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  walletId: string;

  @ApiProperty({ example: 100.50 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'USD' })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({ enum: WalletTransactionDirection, example: WalletTransactionDirection.DEBIT })
  @IsNotEmpty()
  @IsEnum(WalletTransactionDirection)
  direction: WalletTransactionDirection;

  @ApiProperty({ enum: WalletTransactionType, example: WalletTransactionType.PAYMENT })
  @IsNotEmpty()
  @IsEnum(WalletTransactionType)
  type: WalletTransactionType;

  @ApiProperty({ example: 'TXN-123456789' })
  @IsNotEmpty()
  @IsString()
  transactionCode: string;
}

