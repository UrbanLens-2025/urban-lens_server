import { LocationBookingResponseDto } from '@/common/dto/location-booking/res/LocationBooking.response.dto';
import { SearchBookingsByLocationDto } from '@/common/dto/location-booking/SearchBookingsByLocation.dto';
import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';
import { GetBookingByIdDto } from '@/common/dto/location-booking/GetBookingById.dto';

export const ILocationBookingQueryService = Symbol(
  'ILocationBookingQueryService',
);
export interface ILocationBookingQueryService {
  searchBookingsByLocation(
    dto: SearchBookingsByLocationDto,
  ): Promise<Paginated<LocationBookingResponseDto>>;

  getBookingForMyLocationById(
    dto: GetBookingByIdDto,
  ): Promise<LocationBookingResponseDto>;
}

export namespace ILocationBookingQueryService_QueryConfig {
  export function searchBookingsByLocation(): PaginateConfig<LocationBookingEntity> {
    return {
      sortableColumns: ['createdAt'],
      filterableColumns: {
        status: true,
      },
      relations: {
        referencedEventRequest: true,
        createdBy: true,
      },
    };
  }
}
