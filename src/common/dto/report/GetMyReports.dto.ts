import { IsOptional, IsString } from 'class-validator';
import { type PaginateQuery } from 'nestjs-paginate';

export class GetMyReportsDto {
  @IsString()
  @IsOptional()
  userId: string;

  query: PaginateQuery;
}
