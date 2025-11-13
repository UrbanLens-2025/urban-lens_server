import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateWithdrawTransactionDto {
  @ApiProperty({ example: 100000 })
  @IsPositive()
  @IsNotEmpty()
  amountToWithdraw: number;

  @ApiProperty({ enum: SupportedCurrency, example: SupportedCurrency.VND })
  @IsEnum(SupportedCurrency)
  @IsNotEmpty()
  currency: SupportedCurrency;

  @ApiProperty({
    description: 'Bank name for withdrawal',
    example: 'Vietcombank',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  withdrawBankName: string;

  @ApiProperty({
    description: 'Bank account number for withdrawal',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  withdrawBankAccountNumber: string;

  @ApiProperty({
    description: 'Bank account holder name',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  withdrawBankAccountName: string;

  // transient
  accountId: string;
  accountName: string;
}
