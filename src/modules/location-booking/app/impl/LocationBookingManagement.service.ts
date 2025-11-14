import { CoreService } from '@/common/core/Core.service';
import { CreateBookingForBusinessLocationDto } from '@/common/dto/location-booking/CreateBookingForBusinessLocation.dto';
import { ILocationBookingManagementService } from '@/modules/location-booking/app/ILocationBookingManagement.service';
import {
  BadRequestException,
  Inject,
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
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BOOKING_APPROVED_EVENT,
  BookingApprovedEvent,
} from '@/modules/location-booking/domain/event/BookingApproved.event';
import { UpdateResult } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';
import dayjs from 'dayjs';
import { IWalletTransactionCoordinatorService } from '@/modules/wallet/app/IWalletTransactionCoordinator.service';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { LocationBookingDateEntity } from '@/modules/location-booking/domain/LocationBookingDate.entity';
import { PayForBookingDto } from '@/common/dto/location-booking/PayForBooking.dto';
import { LocationBookingConfigRepository } from '@/modules/location-booking/infra/repository/LocationBookingConfig.repository';
import { IScheduledJobService } from '@/modules/scheduled-jobs/app/IScheduledJob.service';
import { ScheduledJobType } from '@/common/constants/ScheduledJobType.constant';

@Injectable()
export class LocationBookingManagementService
  extends CoreService
  implements ILocationBookingManagementService
{
  private readonly MAX_TIME_TO_PAY_MINUTES: number; // 12 hours
  private readonly MILLIS_TO_EVENT_PAYOUT: number;

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly eventEmitter: EventEmitter2,
    @Inject(IWalletTransactionCoordinatorService)
    private readonly walletTransactionCoordinatorService: IWalletTransactionCoordinatorService,
    @Inject(IScheduledJobService)
    private readonly scheduledJobService: IScheduledJobService,
  ) {
    super();
    this.MILLIS_TO_EVENT_PAYOUT = 1000 * 60 * 60 * 24 * 7; // TODO 7 days
    this.MAX_TIME_TO_PAY_MINUTES = 1000 * 60 * 60 * 12; // TODO 24 hours
  }
  createBooking_ForBusinessLocation(
    dto: CreateBookingForBusinessLocationDto,
  ): Promise<LocationBookingResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const locationBookingRepository = LocationBookingRepository(em);
      const locationRepository = LocationRepositoryProvider(em);
      const locationAvailabilityRepository = LocationAvailabilityRepository(em);
      const locationBookingConfigRepository =
        LocationBookingConfigRepository(em);

      const location = await locationRepository
        .findOneOrFail({
          where: {
            id: dto.locationId,
          },
        })
        .then(async (res) => {
          const bookingConfig = await locationBookingConfigRepository.findOne({
            where: {
              locationId: res.id,
            },
          });

          if (!bookingConfig) {
            throw new BadRequestException(
              'This location has not been configured for bookings yet.',
            );
          }
          res.bookingConfig = bookingConfig;
          return res;
        })
        .then((res) => {
          if (!res.canBeBooked()) {
            throw new BadRequestException('This location cannot be booked.');
          }

          return res;
        });

      // check availability for all provided date ranges (TODO)
      // for (const range of dto.dates) { /* validate availability */ }

      // calculate pricing
      const totalNumberOfHoursBooked = dto.dates.reduce((sum, curr) => {
        const start = dayjs(curr.startDateTime);
        const end = dayjs(curr.endDateTime);
        const hours = end.diff(start, 'hour');
        return sum + hours;
      }, 0);
      const bookingPrice =
        location.bookingConfig.baseBookingPrice * totalNumberOfHoursBooked;

      // save booking
      const booking = new LocationBookingEntity();
      booking.locationId = dto.locationId;
      booking.amountToPay = bookingPrice;
      booking.createdById = dto.accountId;
      booking.status = LocationBookingStatus.AWAITING_BUSINESS_PROCESSING;
      // attach dates
      booking.dates = dto.dates.map((d) =>
        this.mapTo_safe(LocationBookingDateEntity, {
          startDateTime: d.startDateTime,
          endDateTime: d.endDateTime,
        }),
      );

      return (
        locationBookingRepository
          .save(booking)
          // map to response dto
          .then((res) => this.mapTo(LocationBookingResponseDto, res))
      );
    });
  }

  processBooking(dto: ProcessBookingDto): Promise<UpdateResult> {
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

      const now = new Date();

      booking.status = dto.status;
      booking.softLockedUntil = dayjs(now)
        .add(this.MAX_TIME_TO_PAY_MINUTES, 'minutes')
        .toDate();
      const updateResult = await locationBookingRepository.update(
        { id: booking.id },
        {
          status: booking.status,
          softLockedUntil: booking.softLockedUntil,
        },
      );

      // update parent object based on booking type
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
      this.eventEmitter.emit(
        BOOKING_APPROVED_EVENT,
        new BookingApprovedEvent(booking),
      );

      return updateResult;
    });
  }

  payForBooking(dto: PayForBookingDto): Promise<LocationBookingResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const locationBookingRepository = LocationBookingRepository(em);

      const booking = await locationBookingRepository.findOneOrFail({
        where: {
          id: dto.locationBookingId,
          createdById: dto.accountId,
        },
        relations: {
          referencedEventRequest: true,
        },
      });

      if (!booking.canStartPayment()) {
        throw new BadRequestException(
          'This booking cannot start payment process. It needs to be approved and not expired.',
        );
      }

      const transaction =
        await this.walletTransactionCoordinatorService.coordinateTransferToEscrow(
          {
            entityManager: em,
            fromAccountId: dto.accountId,
            amountToTransfer: booking.amountToPay,
            currency: SupportedCurrency.VND,
            accountName: dto.accountName,
            ipAddress: dto.ipAddress,
            returnUrl: dto.returnUrl,
          },
        );

      booking.referencedTransactionId = transaction.id;
      booking.status = LocationBookingStatus.PAYMENT_RECEIVED;

      // schedule job for payout to business after event completion
      if (booking.amountToPay > 0) {
        const maximumBookingDate = booking.dates.reduce((max, curr) => {
          const currEnd = dayjs(curr.endDateTime);
          return currEnd.isAfter(max) ? currEnd : max;
        }, dayjs(0));

        const executeAt = maximumBookingDate.add(
          this.MILLIS_TO_EVENT_PAYOUT,
          'milliseconds',
        );
        const job =
          await this.scheduledJobService.createLongRunningScheduledJob({
            entityManager: em,
            executeAt: executeAt.toDate(),
            jobType: ScheduledJobType.LOCATION_BOOKING_PAYOUT,
            payload: {
              locationBookingId: booking.id,
            },
          });
        booking.scheduledPayoutJobId = job.id;
      } else {
        // in the case the booking was free
        booking.paidOutAt = new Date();
        booking.scheduledPayoutJobId = null;
      }

      await locationBookingRepository.update({ id: booking.id }, booking);

      return this.mapTo(LocationBookingResponseDto, booking);
    });
  }
}
