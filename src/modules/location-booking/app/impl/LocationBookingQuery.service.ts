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
import { GetBookedDatesByDateRangeDto } from '@/common/dto/location-booking/GetBookedDatesByDateRange.dto';
import {
  BookedDateResponseDto,
  BookedDatesResponseDto,
} from '@/common/dto/location-booking/res/BookedDate.response.dto';
import { LocationBookingDateRepository } from '@/modules/location-booking/infra/repository/LocationBookingDate.repository';
import { In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';
import { GetAllBookingsAtLocationPagedDto } from '@/common/dto/location-booking/GetAllBookingsAtLocationPaged.dto';
import { GetConflictingBookingsDto } from '@/common/dto/location-booking/GetConflictingBookings.dto';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { LocationBookingObject } from '@/common/constants/LocationBookingObject.constant';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { SearchAllBookingsUnfilteredDto } from '@/common/dto/location-booking/SearchAllBookingsUnfiltered.dto';
import { GetAnyBookingByIdDto } from '@/common/dto/location-booking/GetAnyBookingById.dto';
import { EventEntity } from '@/modules/event/domain/Event.entity';

@Injectable()
export class LocationBookingQueryService
  extends CoreService
  implements ILocationBookingQueryService
{
  async searchBookingsByLocation(
    dto: SearchBookingsByLocationDto,
  ): Promise<Paginated<LocationBookingResponseDto>> {
    const eventRepo = EventRepository(this.dataSource);
    const locationBookingRepo = LocationBookingRepository(this.dataSource);
    const bookingData = await paginate(dto.query, locationBookingRepo, {
      ...ILocationBookingQueryService_QueryConfig.searchBookingsByLocation(),
      where: {
        location: {
          businessId: dto.accountId,
        },
      },
    });

    const eventIds = bookingData.data
      .filter((item) => item.bookingObject === LocationBookingObject.FOR_EVENT)
      .map((item) => item.targetId)
      .filter((item) => item !== undefined && item !== null);
    const eventData = await eventRepo.find({
      where: {
        id: In(eventIds),
      },
    });

    return this.mapToPaginated(LocationBookingResponseDto, {
      ...bookingData,
      data: bookingData.data.map((item) => {
        const event = eventData.find((event) => event.id === item.targetId);
        return {
          ...item,
          event: event ? this.mapTo(EventResponseDto, event) : undefined,
        };
      }),
    } as unknown as Paginated<LocationBookingResponseDto>);
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
          scheduledPayoutJob: true,
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
        locationId: dto.locationId,
        startDate: dto.startDate,
        endDate: dto.endDate,
        statuses: [
          LocationBookingStatus.AWAITING_BUSINESS_PROCESSING,
          LocationBookingStatus.APPROVED,
        ],
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
    })
      .then(async (res) => {
        const eventRepo = EventRepository(this.dataSource);

        // grab event data
        const eventIds = res.data
          .filter(
            (item) => item.bookingObject === LocationBookingObject.FOR_EVENT,
          )
          .map((item) => item.targetId);
        const eventData = await eventRepo.find({
          where: {
            id: In(eventIds),
          },
        });

        // map to response
        return {
          ...res,
          data: res.data.map((item) => {
            const event = eventData.find((event) => event.id === item.targetId);
            return {
              ...item,
              event: event ? this.mapTo(EventResponseDto, event) : undefined,
            } as unknown as LocationBookingResponseDto;
          }),
        } as unknown as Paginated<LocationBookingResponseDto>;
      })
      .then((res) => this.mapToPaginated(LocationBookingResponseDto, res));
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

  async getAllBookingsUnfiltered(
    dto: SearchAllBookingsUnfilteredDto,
  ): Promise<Paginated<LocationBookingResponseDto>> {
    const eventRepo = EventRepository(this.dataSource);
    const locationBookingRepo = LocationBookingRepository(this.dataSource);
    const bookingData = await paginate(
      dto.query,
      locationBookingRepo,
      ILocationBookingQueryService_QueryConfig.getAllBookingsUnfiltered(),
    );

    const eventIds = bookingData.data
      .filter((item) => item.bookingObject === LocationBookingObject.FOR_EVENT)
      .map((item) => item.targetId)
      .filter((item) => item !== undefined && item !== null);
    const eventData = await eventRepo.find({
      where: {
        id: In(eventIds),
      },
    });

    return this.mapToPaginated(LocationBookingResponseDto, {
      ...bookingData,
      data: bookingData.data.map((item) => {
        const event = eventData.find((event) => event.id === item.targetId);
        return {
          ...item,
          event: event ? this.mapTo(EventResponseDto, event) : undefined,
        };
      }),
    } as unknown as Paginated<LocationBookingResponseDto>);
  }

  async getAnyBookingById(
    dto: GetAnyBookingByIdDto,
  ): Promise<LocationBookingResponseDto> {
    const locationBookingRepository = LocationBookingRepository(
      this.dataSource,
    );
    const booking = await locationBookingRepository.findOneOrFail({
      where: {
        id: dto.bookingId,
      },
      relations: {
        referencedTransaction: true,
        createdBy: {
          creatorProfile: true,
        },
        location: {
          business: true,
        },
        dates: true,
        scheduledPayoutJob: true,
      },
    });

    let event: EventEntity | undefined = undefined;
    if (
      booking.bookingObject === LocationBookingObject.FOR_EVENT &&
      booking.targetId
    ) {
      const eventRepo = EventRepository(this.dataSource);
      event = await eventRepo.findOne({
        where: {
          id: booking.targetId,
        },
      }) ?? undefined;
    }

    const mappedBooking = this.mapTo(LocationBookingResponseDto, booking);
    return {
      ...mappedBooking,
      event: event ? this.mapTo(EventResponseDto, event) : undefined,
    };
  }
}
