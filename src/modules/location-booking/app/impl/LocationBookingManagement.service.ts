import { CoreService } from '@/common/core/Core.service';
import { CreateBookingForBusinessLocationDto } from '@/common/dto/location-booking/CreateBookingForBusinessLocation.dto';
import { ILocationBookingManagementService } from '@/modules/location-booking/app/ILocationBookingManagement.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { LocationBookingRepository } from '@/modules/location-booking/infra/repository/LocationBooking.repository';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { LocationAvailabilityRepository } from '@/modules/location-booking/infra/repository/LocationAvailability.repository';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';
import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';
import { LocationBookingResponseDto } from '@/common/dto/location-booking/res/LocationBooking.response.dto';
import { ProcessBookingDto } from '@/common/dto/location-booking/ProcessBooking.dto';
import { LocationBookingObject } from '@/common/constants/LocationBookingObject.constant';
import { EventRequestStatus } from '@/common/constants/EventRequestStatus.constant';
import { EventRequestRepository } from '@/modules/event/infra/repository/EventRequest.repository';

@Injectable()
export class LocationBookingManagementService
  extends CoreService
  implements ILocationBookingManagementService
{
  createBooking_ForBusinessLocation(
    dto: CreateBookingForBusinessLocationDto,
  ): Promise<LocationBookingResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const locationBookingRepository = LocationBookingRepository(em);
      const locationRepository = LocationRepositoryProvider(em);
      const locationAvailabilityRepository = LocationAvailabilityRepository(em);

      const location = await locationRepository.findOneOrFail({
        where: {
          id: dto.locationId,
        },
        relations: {
          bookingConfig: true,
        },
      });

      if (!location.canBeBooked()) {
        throw new BadRequestException('This location cannot be booked.');
      }

      // check availability in the selected range
      // TODO - implement availability check

      // calculate pricing
      const bookingPrice = location.bookingConfig.baseBookingPrice;

      // save booking
      const booking = this.mapTo_safe(LocationBookingEntity, dto);
      booking.amountToPay = bookingPrice;
      booking.createdById = dto.accountId;
      booking.status = LocationBookingStatus.AWAITING_BUSINESS_PROCESSING;

      return (
        locationBookingRepository
          .save(booking)
          // map to response dto
          .then((res) => this.mapTo(LocationBookingResponseDto, res))
      );
    });
  }

  processBooking(dto: ProcessBookingDto): Promise<void> {
    return this.ensureTransaction(null, async (em) => {
      const locationBookingRepository = LocationBookingRepository(em);
      const eventRequestRepository = EventRequestRepository(em);

      const booking = await locationBookingRepository.findOneOrFail({
        where: {
          id: dto.bookingId,
          location: {
            businessId: dto.accountId, // you can only process your locations
          },
        },
        relations: {
          referencedEventRequest: true,
        },
      });

      if (!booking.canBeProcessed()) {
        throw new BadRequestException(
          'This booking cannot be processed. It is either already processed or cancelled.',
        );
      }

      booking.status = dto.status;

      await locationBookingRepository.update({ id: booking.id }, booking);

      switch (booking.bookingObject) {
        case LocationBookingObject.FOR_EVENT: {
          if (!booking.referencedEventRequest) {
            throw new InternalServerErrorException(
              'Booking is for event but no referenced event request found.',
            );
          }

          // update referenced event request status
          const eventRequest = booking.referencedEventRequest;
          eventRequest.status = EventRequestStatus.PROCESSED;
          await eventRequestRepository.update(
            { id: eventRequest.id },
            eventRequest,
          );
          break;
        }
        default: {
          throw new InternalServerErrorException(
            'Unknown booking object type.',
          );
        }
      }

      // emit events for notifications
    });
  }
}
