import { CoreService } from '@/common/core/Core.service';
import { GetAnyLocationByIdDto } from '@/common/dto/business/GetAnyLocationById.dto';
import { GetMyCreatedLocationsDto } from '@/common/dto/business/GetMyCreatedLocations.dto';
import { GetNearbyVisibleLocationsByCoordinatesDto } from '@/common/dto/business/GetNearbyVisibleLocationsByCoordinates.dto';
import { GetVisibleLocationByIdDto } from '@/common/dto/business/GetVisibleLocationById.dto';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import {
  ILocationQueryService,
  ILocationQueryService_QueryConfig,
} from '@/modules/business/app/ILocationQuery.service';
import { Injectable } from '@nestjs/common';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { GetVisibleLocationsByBusinessIdDto } from '@/common/dto/business/GetVisibleLocationsByBusinessId.dto';
import { GetMyCreatedLocationByIdDto } from '@/common/dto/business/GetMyCreatedLocationById.dto';
import { LocationWithDistanceResponseDto } from '@/common/dto/business/stub/LocationWithDistance.response.dto';

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
          relations: ['business'], // DO NOT CHANGE TO OBJECT.
        },
      )
      .then((locations) => {
        return this.mapToArray(LocationWithDistanceResponseDto, locations);
      });
  }

  getVisibleLocationById(
    dto: GetVisibleLocationByIdDto,
  ): Promise<LocationWithDistanceResponseDto> {
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
      .then(async (e) => {
        const res = this.mapTo(LocationWithDistanceResponseDto, e);
        if (
          this.isDefined(dto.currentLatitude) &&
          this.isDefined(dto.currentLongitude)
        ) {
          res.distanceMeters = await locationRepository.calculateDistanceTo({
            locationId: e.id,
            dest: {
              latitude: dto.currentLatitude,
              longitude: dto.currentLongitude,
            },
          });
        }
        return res;
      });
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
      ...ILocationQueryService_QueryConfig.searchVisibleLocations(),
      where: {
        isVisibleOnMap: true,
      },
    }).then((res) => this.mapToPaginated(LocationResponseDto, res));
  }

  getMyCreatedLocations(
    dto: GetMyCreatedLocationsDto,
  ): Promise<Paginated<LocationResponseDto>> {
    const locationRepository = LocationRepositoryProvider(this.dataSource);

    return paginate(dto.query, locationRepository, {
      ...ILocationQueryService_QueryConfig.getMyCreatedLocations(),
      where: {
        businessId: dto.businessId,
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
      ...ILocationQueryService_QueryConfig.searchAnyLocation(),
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
