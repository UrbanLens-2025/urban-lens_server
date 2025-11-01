import { SearchBookableLocationsDto } from '@/common/dto/location-booking/SearchBookableLocations.dto';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { GetBookableLocationByIdDto } from '@/common/dto/location-booking/GetBookableLocationById.dto';

export const IBookableLocationSearchService = Symbol(
  'IBookableLocationSearchService',
);
export interface IBookableLocationSearchService {
  searchBookableLocations(
    dto: SearchBookableLocationsDto,
  ): Promise<Paginated<LocationResponseDto>>;

  getBookableLocationById(
    dto: GetBookableLocationByIdDto,
  ): Promise<LocationResponseDto>;
}

export namespace IBookableLocationSearchService_QueryConfig {
  export function searchBookableLocations(): PaginateConfig<LocationEntity> {
    return {
      sortableColumns: ['createdAt', 'updatedAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      select: ['*', 'bookingConfig.*'],
      relations: {
        bookingConfig: true,
      },
    };
  }
}
