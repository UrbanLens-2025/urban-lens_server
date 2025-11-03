import { PaginateQuery } from 'nestjs-paginate';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class SearchVisibleAnnouncementsDto {
  // transient
  query: PaginateQuery;

  @ApiProperty({ description: 'Location ID' })
  @IsUUID()
  @IsNotEmpty()
  locationId: string;
}
