import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { PaginateQuery } from 'nestjs-paginate';

export class GetExternalTransactionsByWalletIdDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Account ID (Wallet Primary Key)',
  })
  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  // Transient field - populated from query params
  query: PaginateQuery;
}
