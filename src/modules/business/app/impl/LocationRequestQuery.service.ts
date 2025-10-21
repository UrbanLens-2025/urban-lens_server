import { ILocationRequestQueryService } from '@/modules/business/app/ILocationRequestQuery.service';
import { CoreService } from '@/common/core/Core.service';
import { Injectable } from '@nestjs/common';
import { LocationRequestRepository } from '@/modules/business/infra/repository/LocationRequest.repository';
import { LocationRequestResponseDto } from '@/common/dto/business/res/LocationRequest.response.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { GetAnyLocationRequestByIdDto } from '@/common/dto/business/GetAnyLocationRequestById.dto';
import { GetMyLocationRequestByIdDto } from '@/common/dto/business/GetMyLocationRequestById.dto';
import { AccountHelper } from '@/modules/account/app/helper/Account.helper';

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
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      where: {
        createdById: accountId,
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
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      relations: {
        createdBy: {
          businessProfile: true,
          userProfile: true,
        },
        processedBy: true,
        tags: true,
        createdLocation: true,
      },
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
