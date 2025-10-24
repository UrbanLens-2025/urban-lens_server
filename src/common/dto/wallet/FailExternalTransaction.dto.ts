import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class FailExternalTransactionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  transactionId: string;

  @ApiProperty({ example: 'Insufficient funds' })
  @IsNotEmpty()
  @IsString()
  failureReason: string;
}
