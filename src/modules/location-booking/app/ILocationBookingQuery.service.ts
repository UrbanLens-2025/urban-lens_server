import { LocationBookingResponseDto } from '@/common/dto/location-booking/res/LocationBooking.response.dto';
import { SearchBookingsByLocationDto } from '@/common/dto/location-booking/SearchBookingsByLocation.dto';
import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';
import { GetBookingByIdDto } from '@/common/dto/location-booking/GetBookingById.dto';
import { GetBookedDatesByDateRangeDto } from '@/common/dto/location-booking/GetBookedDatesByDateRange.dto';
import { BookedDatesResponseDto } from '@/common/dto/location-booking/res/BookedDate.response.dto';
import { GetAllBookingsAtLocationByDateRangeDto } from '@/common/dto/location-booking/GetAllBookingsAtLocationByDateRange.dto';
import { GetAllBookingsAtLocationPagedDto } from '@/common/dto/location-booking/GetAllBookingsAtLocationPaged.dto';
import { GetConflictingBookingsDto } from '@/common/dto/location-booking/GetConflictingBookings.dto';
import { SearchAllBookingsUnfilteredDto } from '@/common/dto/location-booking/SearchAllBookingsUnfiltered.dto';
import { GetAnyBookingByIdDto } from '@/common/dto/location-booking/GetAnyBookingById.dto';

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

  getBookedDatesByDateRange(
    dto: GetBookedDatesByDateRangeDto,
  ): Promise<BookedDatesResponseDto>;

  getAllBookingsAtLocationPaged(
    dto: GetAllBookingsAtLocationPagedDto,
  ): Promise<Paginated<LocationBookingResponseDto>>;

  getConflictingBookings(
    dto: GetConflictingBookingsDto,
  ): Promise<LocationBookingResponseDto[]>;

  getAllBookingsUnfiltered(
    dto: SearchAllBookingsUnfilteredDto,
  ): Promise<Paginated<LocationBookingResponseDto>>;

  getAnyBookingById(
    dto: GetAnyBookingByIdDto,
  ): Promise<LocationBookingResponseDto>;
}

export namespace ILocationBookingQueryService_QueryConfig {
  export function searchBookingsByLocation(): PaginateConfig<LocationBookingEntity> {
    return {
      sortableColumns: ['createdAt'],
      filterableColumns: {
        status: true,
        locationId: true,
      },
      relations: {
        createdBy: true,
        location: true,
        dates: true,
        scheduledPayoutJob: true,
        fines: true,
      },
    };
  }

  export function getAllBookingsUnfiltered(): PaginateConfig<LocationBookingEntity> {
    return {
      sortableColumns: ['createdAt', 'updatedAt', 'status'],
      defaultSortBy: [['createdAt', 'DESC']],
      filterableColumns: {
        status: true,
        locationId: true,
        bookingObject: true,
      },
      relations: {
        createdBy: {
          creatorProfile: true,
        },
        location: {
          business: true,
        },
        dates: true,
        scheduledPayoutJob: true,
        referencedTransaction: true,
      },
    };
  }
}
