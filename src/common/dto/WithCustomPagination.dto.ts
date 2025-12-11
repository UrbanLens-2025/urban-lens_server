export class WithCustomPaginationDto<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
}
