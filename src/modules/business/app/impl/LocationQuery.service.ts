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
import { LocationWithDistanceResponseDto } from '@/common/dto/business/stub/LocationWithDistance.response.dto';
import { CheckInRepositoryProvider } from '@/modules/business/infra/repository/CheckIn.repository';

@Injectable()
export class LocationQueryService
  extends CoreService
  implements ILocationQueryService
{
  getNearbyVisibleLocationsByCoordinates(
    dto: GetNearbyVisibleLocationsByCoordinatesDto,
  ): Promise<LocationWithDistanceResponseDto[]> {
    const locationRepository = LocationRepositoryProvider(this.dataSource);
    return locationRepository
      .findNearbyLocations(
        {
          latitude: dto.latitude,
          longitude: dto.longitude,
          radiusInMeters: dto.radiusMeters,
        },
        {
          where: {
            isVisibleOnMap: true,
          },
          relations: ['business'],
        },
      )
      .then((locations) => {
        return this.mapToArray(LocationWithDistanceResponseDto, locations);
      });
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
        relations: {
          business: true,
          tags: {
            tag: true,
          },
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
        relations: {
          business: true,
          tags: {
            tag: true,
          },
        },
      })
      .then((e) => this.mapToArray(LocationResponseDto, e));
  }

  searchVisibleLocations(
    query: PaginateQuery,
  ): Promise<Paginated<LocationResponseDto>> {
    const locationRepository = LocationRepositoryProvider(this.dataSource);
    return paginate(query, locationRepository, {
      sortableColumns: ['name', 'createdAt', 'updatedAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [
        'name',
        'description',
        'addressLine',
        'addressLevel1',
        'addressLevel2',
      ],
      where: {
        isVisibleOnMap: true,
      },
      relations: {
        business: true,
        tags: {
          tag: true,
        },
      },
    }).then((res) => this.mapToPaginated(LocationResponseDto, res));
  }

  getMyCheckedInLocations(
    dto: GetMyCheckedInLocationsDto,
  ): Promise<Paginated<LocationResponseDto>> {
    const checkInRepository = CheckInRepositoryProvider(this.dataSource);
    return paginate(dto.query, checkInRepository, {
      sortableColumns: ['checkInTime'],
      defaultSortBy: [['checkInTime', 'DESC']],
      where: {
        userProfileId: dto.accountId,
      },
      relations: {
        location: true,
      },
    }).then(
      (e) =>
        ({
          ...e,
          data: this.mapToArray(
            LocationResponseDto,
            e.data.map((checkIn) => checkIn.location),
          ),
        }) as Paginated<LocationResponseDto>,
    );
  }

  getMyCreatedLocations(
    dto: GetMyCreatedLocationsDto,
  ): Promise<Paginated<LocationResponseDto>> {
    const locationRepository = LocationRepositoryProvider(this.dataSource);

    return paginate(dto.query, locationRepository, {
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
      where: {
        businessId: dto.businessId,
      },
      relations: {
        business: true,
        tags: {
          tag: true,
        },
      },
    }).then((e) => this.mapToPaginated(LocationResponseDto, e));
  }

  getMyCreatedLocationById(
    dto: GetMyCreatedLocationByIdDto,
  ): Promise<LocationResponseDto> {
    const locationRepository = LocationRepositoryProvider(this.dataSource);
    return locationRepository
      .findOneOrFail({
        where: {
          id: dto.locationId,
          businessId: dto.businessId,
        },
        relations: {
          business: true,
          tags: {
            tag: true,
          },
        },
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
      relations: {
        business: true,
        tags: {
          tag: true,
        },
      },
    }).then((res) => this.mapToPaginated(LocationResponseDto, res));
  }

  getAnyLocationById(dto: GetAnyLocationByIdDto): Promise<LocationResponseDto> {
    const repo = LocationRepositoryProvider(this.dataSource);
    return repo
      .findOneOrFail({
        where: { id: dto.locationId },
        relations: {
          business: true,
          tags: {
            tag: true,
          },
        },
      })
      .then((location) => this.mapTo(LocationResponseDto, location));
  }
}
