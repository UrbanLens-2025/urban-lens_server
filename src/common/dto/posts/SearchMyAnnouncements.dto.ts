import { PaginateQuery } from 'nestjs-paginate';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class SearchMyAnnouncementsDto {
  // transient
  query: PaginateQuery;
  accountId: string;

  @ApiPropertyOptional({ description: 'Filter by location ID' })
  @IsOptional()
  @IsUUID()
  locationId?: string;
}
