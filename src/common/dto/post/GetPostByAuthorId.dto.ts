import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { type PaginateQuery } from 'nestjs-paginate';

export class GetPostByAuthorIdDto {
  query: PaginateQuery;
  currentUserId?: string;

  @ApiProperty({
    description: 'The id of the author',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  authorId: string;
}
