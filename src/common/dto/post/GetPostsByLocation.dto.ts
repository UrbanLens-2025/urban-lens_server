import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { type PaginateQuery } from 'nestjs-paginate';

export class GetPostsByLocationDto {
  query: PaginateQuery;

  @ApiProperty({
    description: 'The id of the location',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  locationId: string;

  currentUserId?: string;
}

