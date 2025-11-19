import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { type PaginateQuery } from 'nestjs-paginate';

export class GetCommentReactionsDto {
  query: PaginateQuery;

  @ApiProperty({
    description: 'The id of the comment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  commentId: string;
}

