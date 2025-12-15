import { PaginateQuery } from 'nestjs-paginate';

export class GetAllTransactionsByWalletIdDto {
  query: PaginateQuery;
  walletId: string;
}
