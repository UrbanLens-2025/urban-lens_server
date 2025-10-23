import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { WalletTransactionStatus } from '@/common/constants/WalletTransactionStatus.constant';

export class UpdateTransactionStatusDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  transactionId: string;

  @ApiProperty({ enum: WalletTransactionStatus, example: WalletTransactionStatus.COMPLETED })
  @IsNotEmpty()
  @IsEnum(WalletTransactionStatus)
  status: WalletTransactionStatus;
}

