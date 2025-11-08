import { CoreService } from '@/common/core/Core.service';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { SearchBookableLocationsDto } from '@/common/dto/location-booking/SearchBookableLocations.dto';
import {
  IBookableLocationSearchService,
  IBookableLocationSearchService_QueryConfig,
} from '@/modules/location-booking/app/IBookableLocationSearch.service';
import { Injectable } from '@nestjs/common';
import { paginate, Paginated } from 'nestjs-paginate';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { GetBookableLocationByIdDto } from '@/common/dto/location-booking/GetBookableLocationById.dto';
import { LocationOwnershipType } from '@/common/constants/LocationType.constant';

@Injectable()
export class BookableLocationSearchService
  extends CoreService
  implements IBookableLocationSearchService
{
  getBookableLocationById(
    dto: GetBookableLocationByIdDto,
  ): Promise<LocationResponseDto> {
    const locationRepository = LocationRepositoryProvider(this.dataSource);
    return locationRepository
      .findOne({
        where: {
          id: dto.locationId,
          bookingConfig: {
            allowBooking: true,
          },
        },
        relations: {
          bookingConfig: true,
          business: true,
        },
      })
      .then((res) => this.mapTo(LocationResponseDto, res));
  }

  searchBookableLocations(
    dto: SearchBookableLocationsDto,
  ): Promise<Paginated<LocationResponseDto>> {
    return paginate(dto.query, LocationRepositoryProvider(this.dataSource), {
      ...IBookableLocationSearchService_QueryConfig.searchBookableLocations(),
      where: {
        ownershipType: LocationOwnershipType.OWNED_BY_BUSINESS,
        bookingConfig: {
          allowBooking: true,
        },
      },
    }).then((res) => this.mapToPaginated(LocationResponseDto, res));
  }
}
