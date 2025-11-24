import { PaginateQuery } from 'nestjs-paginate';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class SearchPublishedEventsByTagCategoryDto {
  query: PaginateQuery;

  @ApiProperty({
    isArray: true,
    type: Number,
    example: [1, 2, 3],
    description: 'Array of tag category IDs',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  tagCategoryIds: number[];
}
