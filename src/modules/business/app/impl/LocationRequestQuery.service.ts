import {
  ILocationRequestQueryService,
  ILocationRequestQueryService_QueryConfig,
} from '@/modules/business/app/ILocationRequestQuery.service';
import { CoreService } from '@/common/core/Core.service';
import { Injectable } from '@nestjs/common';
import { LocationRequestRepository } from '@/modules/business/infra/repository/LocationRequest.repository';
import { LocationRequestResponseDto } from '@/common/dto/business/res/LocationRequest.response.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { GetAnyLocationRequestByIdDto } from '@/common/dto/business/GetAnyLocationRequestById.dto';
import { GetMyLocationRequestByIdDto } from '@/common/dto/business/GetMyLocationRequestById.dto';

@Injectable()
export class LocationRequestQueryService
  extends CoreService
  implements ILocationRequestQueryService
{
  getMyLocationRequests(
    accountId: string,
    query: PaginateQuery,
  ): Promise<Paginated<LocationRequestResponseDto>> {
    return paginate(query, LocationRequestRepository(this.dataSource), {
      ...ILocationRequestQueryService_QueryConfig.getMyLocationRequests(),
      where: {
        createdById: accountId,
      },
    }).then((res) => this.mapToPaginated(LocationRequestResponseDto, res));
  }

  getMyLocationRequestById(
    dto: GetMyLocationRequestByIdDto,
  ): Promise<LocationRequestResponseDto> {
    const locationRequestRepository = LocationRequestRepository(
      this.dataSource,
    );

    return locationRequestRepository
      .findOneOrFail({
        where: {
          id: dto.locationRequestId,
          createdById: dto.accountId,
        },
        relations: {
          createdBy: {
            businessProfile: true,
            userProfile: true,
          },
          processedBy: true,
          tags: {
            tag: true,
          },
          createdLocation: true,
        },
      })
      .then((e) => this.mapTo(LocationRequestResponseDto, e));
  }

  searchAllLocationRequests(
    query: PaginateQuery,
  ): Promise<Paginated<LocationRequestResponseDto>> {
    return paginate(query, LocationRequestRepository(this.dataSource), {
      ...ILocationRequestQueryService_QueryConfig.searchAllLocationRequests(),
    }).then((res) => this.mapToPaginated(LocationRequestResponseDto, res));
  }

  getAnyLocationRequestById(
    dto: GetAnyLocationRequestByIdDto,
  ): Promise<LocationRequestResponseDto> {
    const locationRequestRepository = LocationRequestRepository(
      this.dataSource,
    );

    return (
      locationRequestRepository
        .findOneOrFail({
          where: {
            id: dto.locationRequestId,
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
        })
        // populate profiles
        .then((e) => this.mapTo(LocationRequestResponseDto, e))
    );
  }
}
