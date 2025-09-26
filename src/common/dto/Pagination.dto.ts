import { PaginateQuery } from 'nestjs-paginate';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

export class PaginationDto implements PaginateQuery {
  @ApiProperty({ required: false, example: { status: 'active' } })
  filter: { [p: string]: string | string[] };

  @ApiProperty({ required: false, example: 10 })
  limit: number;

  @ApiProperty({ required: false, example: 0, default: 0 })
  page: number;

  @ApiProperty({
    required: false,
    example: 'John Doe',
    description: 'Search term',
  })
  search: string;

  @ApiProperty({
    required: false,
    example: ['firstName', 'lastName'],
    description: 'Columns to search in',
  })
  searchBy: string[];

  @ApiProperty({
    required: false,
    description: 'Columns to include in the result',
  })
  select: string[];

  @ApiProperty({
    required: false,
    example: [['createdAt', 'DESC']],
    description: 'Sorting criteria',
  })
  sortBy: [string, string][];

  // unused
  @ApiHideProperty()
  cursor: string;
  @ApiHideProperty()
  path: string;
  @ApiHideProperty()
  withDeleted: boolean;
}
