import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MarkTransferFailedDto {
  transactionId: string;
  accountId: string;
  accountName: string;

  @ApiProperty({
    description: 'Reason for transfer failure',
    example: 'Invalid bank account number',
  })
  @IsNotEmpty()
  @IsString()
  failureReason: string;
}

