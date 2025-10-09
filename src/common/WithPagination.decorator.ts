import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function WithPagination() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Page number (1-based)',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      example: 10,
      description: 'Items per page',
    }),
    ApiQuery({
      name: 'sortBy',
      required: false,
      type: String,
      isArray: true,
      description: 'Array of [column, direction] pairs (e.g., sortBy=name:ASC)',
    }),
    ApiQuery({
      name: 'searchBy',
      required: false,
      type: 'array',
      items: { type: 'string' },
      description: 'Array of column names to apply search on',
    }),
    ApiQuery({
      name: 'search',
      required: false,
      type: String,
      description: 'Search keyword to apply to the columns defined in searchBy',
    }),
    ApiQuery({
      name: 'select',
      required: false,
      type: 'array',
      items: { type: 'string' },
      description: 'Columns to select from the entity',
    }),
  );
}
