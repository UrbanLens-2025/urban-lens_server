import { CoreService } from '@/common/core/Core.service';
import { GetAnyLocationByIdDto } from '@/common/dto/business/GetAnyLocationById.dto';
import { GetMyCheckedInLocationsDto } from '@/common/dto/business/GetMyCheckedInLocations.dto';
import { GetMyCreatedLocationsDto } from '@/common/dto/business/GetMyCreatedLocations.dto';
import { GetNearbyVisibleLocationsByCoordinatesDto } from '@/common/dto/business/GetNearbyVisibleLocationsByCoordinates.dto';
import { GetVisibleLocationByIdDto } from '@/common/dto/business/GetVisibleLocationById.dto';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { ILocationQueryService } from '@/modules/business/app/ILocationQuery.service';
import { Injectable } from '@nestjs/common';
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { GetVisibleLocationsByBusinessIdDto } from '@/common/dto/business/GetVisibleLocationsByBusinessId.dto';
import { GetMyCreatedLocationByIdDto } from '@/common/dto/business/GetMyCreatedLocationById.dto';

@Injectable()
export class LocationQueryService
  extends CoreService
  implements ILocationQueryService
{
  getNearbyVisibleLocationsByCoordinates(
    dto: GetNearbyVisibleLocationsByCoordinatesDto,
  ): Promise<LocationResponseDto[]> {
    throw new Error('Method not implemented.');
  }

  getVisibleLocationById(
    dto: GetVisibleLocationByIdDto,
  ): Promise<LocationResponseDto> {
    const locationRepository = LocationRepositoryProvider(this.dataSource);
    return locationRepository
      .findOneOrFail({
        where: {
          id: dto.locationId,
          isVisibleOnMap: true,
        },
      })
      .then((e) => this.mapTo(LocationResponseDto, e));
  }

  getVisibleLocationsByBusinessId(
    dto: GetVisibleLocationsByBusinessIdDto,
  ): Promise<LocationResponseDto[]> {
    const locationRepository = LocationRepositoryProvider(this.dataSource);
    return locationRepository
      .find({
        where: {
          businessId: dto.businessId,
          isVisibleOnMap: true,
        },
      })
      .then((e) => this.mapToArray(LocationResponseDto, e));
  }

  getMyCheckedInLocations(
    dto: GetMyCheckedInLocationsDto,
  ): Promise<LocationResponseDto> {
    throw new Error('Method not implemented.');
  }

  getMyCreatedLocations(
    dto: GetMyCreatedLocationsDto,
  ): Promise<LocationResponseDto[]> {
    const locationRepository = LocationRepositoryProvider(this.dataSource);
    return locationRepository
      .find({
        where: {
          businessId: dto.businessId,
        },
      })
      .then((e) => this.mapToArray(LocationResponseDto, e));
  }

  getMyCreatedLocationById(
    dto: GetMyCreatedLocationByIdDto,
  ): Promise<LocationResponseDto> {
    const locationRepository = LocationRepositoryProvider(this.dataSource);
    return locationRepository
      .findOneByOrFail({
        id: dto.locationId,
        businessId: dto.businessId,
      })
      .then((e) => {
        return this.mapTo(LocationResponseDto, e);
      });
  }

  searchAnyLocation(
    query: PaginateQuery,
  ): Promise<Paginated<LocationResponseDto>> {
    return paginate(query, LocationRepositoryProvider(this.dataSource), {
      sortableColumns: ['name', 'createdAt', 'updatedAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [
        'name',
        'description',
        'latitude',
        'longitude',
        'addressLine',
        'addressLevel1',
        'addressLevel2',
      ],
    }).then((res) => this.mapToPaginated(LocationResponseDto, res));
  }

  getAnyLocationById(dto: GetAnyLocationByIdDto): Promise<LocationResponseDto> {
    const repo = LocationRepositoryProvider(this.dataSource);
    return repo
      .findOneByOrFail({ id: dto.locationId })
      .then((location) => this.mapTo(LocationResponseDto, location));
  }
}
