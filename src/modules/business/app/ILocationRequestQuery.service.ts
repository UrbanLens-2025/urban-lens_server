import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { LocationRequestResponseDto } from '@/common/dto/business/res/LocationRequest.response.dto';
import { GetMyLocationRequestByIdDto } from '@/common/dto/business/GetMyLocationRequestById.dto';
import { GetAnyLocationRequestByIdDto } from '@/common/dto/business/GetAnyLocationRequestById.dto';
import { LocationRequestEntity } from '@/modules/business/domain/LocationRequest.entity';

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

export namespace ILocationRequestQueryService_QueryConfig {
  export function getMyLocationRequests(): PaginateConfig<LocationRequestEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      filterableColumns: {
        status: true,
      },
      relations: {
        createdBy: {
          businessProfile: true,
          userProfile: true,
        },
        processedBy: true,
        tags: true,
        createdLocation: true,
      },
    };
  }

  export function searchAllLocationRequests(): PaginateConfig<LocationRequestEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      filterableColumns: {
        status: true,
      },
      relations: {
        createdBy: {
          businessProfile: true,
          userProfile: true,
        },
        processedBy: true,
        tags: true,
        createdLocation: true,
      },
    };
  }
}
