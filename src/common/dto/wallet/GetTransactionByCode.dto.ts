import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetTransactionByCodeDto {
  @ApiProperty({ example: 'TXN-123456789' })
  @IsNotEmpty()
  @IsString()
  transactionCode: string;
}
