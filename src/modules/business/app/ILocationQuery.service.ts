import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { GetAnyLocationByIdDto } from '@/common/dto/business/GetAnyLocationById.dto';
import { GetNearbyVisibleLocationsByCoordinatesDto } from '@/common/dto/business/GetNearbyVisibleLocationsByCoordinates.dto';
import { GetVisibleLocationByIdDto } from '@/common/dto/business/GetVisibleLocationById.dto';
import { GetMyCreatedLocationsDto } from '@/common/dto/business/GetMyCreatedLocations.dto';
import { GetVisibleLocationsByBusinessIdDto } from '@/common/dto/business/GetVisibleLocationsByBusinessId.dto';
import { GetMyCreatedLocationByIdDto } from '@/common/dto/business/GetMyCreatedLocationById.dto';
import { LocationWithDistanceResponseDto } from '@/common/dto/business/stub/LocationWithDistance.response.dto';
import { LocationEntity } from '@/modules/business/domain/Location.entity';

export const ILocationQueryService = Symbol('ILocationQueryService');

export interface ILocationQueryService {
  // public locations
  getNearbyVisibleLocationsByCoordinates(
    dto: GetNearbyVisibleLocationsByCoordinatesDto,
  ): Promise<LocationWithDistanceResponseDto[]>;

  getVisibleLocationById(
    dto: GetVisibleLocationByIdDto,
  ): Promise<LocationWithDistanceResponseDto>;

  getVisibleLocationsByBusinessId(
    dto: GetVisibleLocationsByBusinessIdDto,
  ): Promise<LocationResponseDto[]>;

  searchVisibleLocations(
    query: PaginateQuery,
  ): Promise<Paginated<LocationResponseDto>>;

  // business locations
  getMyCreatedLocations(
    dto: GetMyCreatedLocationsDto,
  ): Promise<Paginated<LocationResponseDto>>;

  getMyCreatedLocationById(
    dto: GetMyCreatedLocationByIdDto,
  ): Promise<LocationResponseDto>;

  // all locations
  searchAnyLocation(
    query: PaginateQuery,
  ): Promise<Paginated<LocationResponseDto>>;

  getAnyLocationById(dto: GetAnyLocationByIdDto): Promise<LocationResponseDto>;
}

export namespace ILocationQueryService_QueryConfig {
  export function searchVisibleLocations(): PaginateConfig<LocationEntity> {
    return {
      sortableColumns: ['name', 'createdAt', 'updatedAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [
        'name',
        'description',
        'addressLine',
        'addressLevel1',
        'addressLevel2',
      ],
      relations: {
        business: true,
        tags: {
          tag: true,
        },
      },
    };
  }

  export function getMyCreatedLocations(): PaginateConfig<LocationEntity> {
    return {
      sortableColumns: ['createdAt', 'updatedAt', 'name'],
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
      filterableColumns: {
        isVisibleOnMap: true,
      },
      relations: {
        business: true,
        tags: {
          tag: true,
        },
      },
    };
  }

  export function searchAnyLocation(): PaginateConfig<LocationEntity> {
    return {
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
      filterableColumns: {
        isVisibleOnMap: true,
      },
      relations: {
        business: true,
        tags: {
          tag: true,
        },
      },
    };
  }
}
