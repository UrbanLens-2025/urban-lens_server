import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { PaginateQuery } from 'nestjs-paginate';

export class GetAccountSuspensionsDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Account ID to get suspensions for',
  })
  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  query: PaginateQuery;
}

