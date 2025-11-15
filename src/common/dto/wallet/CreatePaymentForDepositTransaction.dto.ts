import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentForDepositTransactionDto {
  @ApiProperty({ example: 'http://google.com' })
  @IsNotEmpty()
  @IsString()
  returnUrl: string;

  // transient fields
  transactionId: string;
  ip: string;
  accountId: string;
}
