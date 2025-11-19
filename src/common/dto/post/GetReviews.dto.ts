import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { type PaginateQuery } from 'nestjs-paginate';

export class GetReviewsDto {
  query: PaginateQuery;

  @ApiPropertyOptional({
    description: 'Filter reviews by location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  locationId?: string;

  @ApiPropertyOptional({
    description: 'Filter reviews by event ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  eventId?: string;

  currentUserId?: string;
}

