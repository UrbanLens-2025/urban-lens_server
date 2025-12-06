import { CoreService } from '@/common/core/Core.service';
import {
  ILocationBookingQueryService,
  ILocationBookingQueryService_QueryConfig,
} from '@/modules/location-booking/app/ILocationBookingQuery.service';
import { Injectable } from '@nestjs/common';
import { SearchBookingsByLocationDto } from '@/common/dto/location-booking/SearchBookingsByLocation.dto';
import { LocationBookingResponseDto } from '@/common/dto/location-booking/res/LocationBooking.response.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { LocationBookingRepository } from '@/modules/location-booking/infra/repository/LocationBooking.repository';
import { GetBookingByIdDto } from '@/common/dto/location-booking/GetBookingById.dto';
import { GetBookedDatesByDateRangeDto } from '@/common/dto/location-booking/GetBookedDatesByDateRange.dto';
import {
  BookedDateResponseDto,
  BookedDatesResponseDto,
} from '@/common/dto/location-booking/res/BookedDate.response.dto';
import { LocationBookingDateRepository } from '@/modules/location-booking/infra/repository/LocationBookingDate.repository';
import { GetAllBookingsAtLocationByDateRangeDto } from '@/common/dto/location-booking/GetAllBookingsAtLocationByDateRange.dto';
import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';
import { GetAllBookingsAtLocationPagedDto } from '@/common/dto/location-booking/GetAllBookingsAtLocationPaged.dto';
import { GetConflictingBookingsDto } from '@/common/dto/location-booking/GetConflictingBookings.dto';

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
          createdBy: {
            creatorProfile: true,
          },
          location: true,
        },
      })
      .then((res) => this.mapTo(LocationBookingResponseDto, res));
  }

  getBookedDatesByDateRange(
    dto: GetBookedDatesByDateRangeDto,
  ): Promise<BookedDatesResponseDto> {
    const locationBookingDateRepository = LocationBookingDateRepository(
      this.dataSource,
    );

    return locationBookingDateRepository
      .findBookedDatesByDateRange({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        locationId: dto.locationId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        statuses: [LocationBookingStatus.PAYMENT_RECEIVED],
      })
      .then((results) => {
        const dates = results.map((result) => ({
          startDateTime: result.startDateTime,
          endDateTime: result.endDateTime,
        }));
        const mappedDates = this.mapToArray(BookedDateResponseDto, dates);
        return this.mapTo(BookedDatesResponseDto, { dates: mappedDates });
      });
  }

  getAllBookingsAtLocationPaged(
    dto: GetAllBookingsAtLocationPagedDto,
  ): Promise<Paginated<LocationBookingResponseDto>> {
    return paginate(dto.query, LocationBookingRepository(this.dataSource), {
      ...ILocationBookingQueryService_QueryConfig.searchBookingsByLocation(),
      where: {
        locationId: dto.locationId,
        dates: {
          startDateTime: LessThanOrEqual(dto.endDate),
          endDateTime: MoreThanOrEqual(dto.startDate),
        },
      },
    }).then((res) => this.mapToPaginated(LocationBookingResponseDto, res));
  }

  async getConflictingBookings(
    dto: GetConflictingBookingsDto,
  ): Promise<LocationBookingResponseDto[]> {
    const locationBookingRepository = LocationBookingRepository(
      this.dataSource,
    );
    const locationBooking = await locationBookingRepository.findOneOrFail({
      where: {
        id: dto.locationBookingId,
      },
    });

    const startDate = locationBooking.getStartDate();
    const endDate = locationBooking.getEndDate();
    if (!startDate || !endDate) {
      return [];
    }

    return locationBookingRepository
      .findConflictingBookings({
        locationId: locationBooking.locationId,
        startDate,
        endDate,
      })
      .then((res) => this.mapToArray(LocationBookingResponseDto, res));
  }
}
