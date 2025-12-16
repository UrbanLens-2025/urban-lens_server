import { PaginateQuery } from 'nestjs-paginate';

export class GetVoucherUsersDto {
  businessOwnerId: string;

  query: PaginateQuery;
}
