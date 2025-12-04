import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CompleteProcessingWithdrawTransactionDto {
  transactionId: string;
  accountId: string;
  accountName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @IsUrl({}, { each: true })
  proofOfTransferImages: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  transferBankTransactionId: string;
}
