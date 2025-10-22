import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function WithPaginationTest() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      example: 1,
      description: 'Page number (Starting from 1)',
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
      example: ['createdAt:DESC'],
      description:
        'Array of [column, direction] pairs (Example: name:ASC, createdAt:DESC)',
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
      name: 'filter',
      style: 'deepObject',
      explode: true,
      type: 'object',
      example: {
        status: '$eq:AWAITING_ADMIN_REVIEW',
        type: '$eq:BUSINESS_OWNED',
      },
      description:
        'Filters. Format: ?filter[field]=$operator:value. Example: ?filter[status]=$eq:ACTIVE',
    }),
  );
}
