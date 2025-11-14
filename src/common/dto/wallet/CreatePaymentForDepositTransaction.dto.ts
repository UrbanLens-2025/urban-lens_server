import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsUrl, IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentForDepositTransactionDto {
  @ApiProperty({ example: 'http://google.com' })
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  returnUrl: string;

  // transient fields
  transactionId: string;
  ip: string;
  accountId: string;
}
