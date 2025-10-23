import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetWalletWithTransactionsDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Account ID (Wallet Primary Key)' })
  @IsNotEmpty()
  @IsUUID()
  accountId: string;
}
