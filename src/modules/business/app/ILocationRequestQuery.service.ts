import { Paginated, PaginateQuery } from 'nestjs-paginate';
import { LocationRequestResponseDto } from '@/common/dto/business/res/LocationRequest.response.dto';
import { GetMyLocationRequestByIdDto } from '@/common/dto/business/GetMyLocationRequestById.dto';
import { GetAnyLocationRequestByIdDto } from '@/common/dto/business/GetAnyLocationRequestById.dto';

export const ILocationRequestQueryService = Symbol(
  'ILocationRequestQueryService',
);
export interface ILocationRequestQueryService {
  getMyLocationRequests(
    accountId: string,
    query: PaginateQuery,
  ): Promise<Paginated<LocationRequestResponseDto>>;

  getMyLocationRequestById(
    dto: GetMyLocationRequestByIdDto,
  ): Promise<LocationRequestResponseDto>;

  searchAllLocationRequests(
    query: PaginateQuery,
  ): Promise<Paginated<LocationRequestResponseDto>>;

  getAnyLocationRequestById(
    dto: GetAnyLocationRequestByIdDto,
  ): Promise<LocationRequestResponseDto>;
}
