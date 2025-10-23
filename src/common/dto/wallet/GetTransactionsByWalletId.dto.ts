import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { PaginateQuery } from 'nestjs-paginate';

export class GetTransactionsByWalletIdDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  walletId: string;

  // Transient field - populated from query params
  query: PaginateQuery;
}
