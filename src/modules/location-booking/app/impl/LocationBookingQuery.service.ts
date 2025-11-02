import { CoreService } from '@/common/core/Core.service';
import {
  ILocationBookingQueryService,
  ILocationBookingQueryService_QueryConfig,
} from '@/modules/location-booking/app/ILocationBookingQuery.service';
import { Injectable } from '@nestjs/common';
import { SearchBookingsByLocationDto } from '@/common/dto/location-booking/SearchBookingsByLocation.dto';
import { LocationBookingResponseDto } from '@/common/dto/location-booking/res/LocationBooking.response.dto';
import { paginate, Paginated } from 'nestjs-paginate';
import { LocationBookingRepository } from '@/modules/location-booking/infra/repository/LocationBooking.repository';
import { GetBookingByIdDto } from '@/common/dto/location-booking/GetBookingById.dto';

@Injectable()
export class LocationBookingQueryService
  extends CoreService
  implements ILocationBookingQueryService
{
  searchBookingsByLocation(
    dto: SearchBookingsByLocationDto,
  ): Promise<Paginated<LocationBookingResponseDto>> {
    return paginate(dto.query, LocationBookingRepository(this.dataSource), {
      ...ILocationBookingQueryService_QueryConfig.searchBookingsByLocation(),
      where: {
        location: {
          businessId: dto.accountId,
        },
      },
    }).then((res) => this.mapToPaginated(LocationBookingResponseDto, res));
  }

  getBookingForMyLocationById(
    dto: GetBookingByIdDto,
  ): Promise<LocationBookingResponseDto> {
    const locationBookingRepository = LocationBookingRepository(
      this.dataSource,
    );
    return locationBookingRepository
      .findOneOrFail({
        where: {
          id: dto.bookingId,
          location: {
            businessId: dto.accountId,
          },
        },
        relations: {
          referencedTransaction: true,
          referencedEventRequest: true,
          createdBy: {
            creatorProfile: true,
          },
        },
      })
      .then((res) => this.mapTo(LocationBookingResponseDto, res));
  }
}
