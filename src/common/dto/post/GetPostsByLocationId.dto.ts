import { PaginateQuery } from 'nestjs-paginate';

export class GetPostsByLocationIdDto {
  query: PaginateQuery;
  locationId: string;
}

