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
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BOOKING_APPROVED_EVENT,
  BookingApprovedEvent,
} from '@/modules/location-booking/domain/event/BookingApproved.event';
import {
  BOOKING_REJECTED_EVENT,
  BookingRejectedEvent,
} from '@/modules/location-booking/domain/event/BookingRejected.event';
import { In, UpdateResult } from 'typeorm';
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
import { DelayedMessageProvider } from '@/common/core/delayed-message/DelayedMessage.provider';
import { DelayedMessageKeys } from '@/common/constants/DelayedMessageKeys.constant';
import { CancelBookingDto } from '@/common/dto/location-booking/CancelBooking.dto';
import { ILocationBookingPayoutService } from '@/modules/location-booking/app/ILocationBookingPayout.service';
import { ProcessAndApproveBookingDto } from '@/common/dto/location-booking/ProcessAndApproveBooking.dto';
import { ProcessAndRejectBookingDto } from '@/common/dto/location-booking/ProcessAndRejectBooking.dto';
import { ForceCancelBookingDto } from '@/common/dto/location-booking/ForceCancelBooking.dto';

@Injectable()
export class LocationBookingManagementService
  extends CoreService
  implements ILocationBookingManagementService
{
  private readonly MAX_TIME_TO_PAY_MS: number; // 12 hours

  constructor(
    private readonly configService: ConfigService<Environment>,
    private readonly eventEmitter: EventEmitter2,
    private readonly delayedMessageProvider: DelayedMessageProvider,
    @Inject(IWalletTransactionCoordinatorService)
    private readonly walletTransactionCoordinatorService: IWalletTransactionCoordinatorService,
    @Inject(ILocationBookingPayoutService)
    private readonly locationBookingPayoutService: ILocationBookingPayoutService,
  ) {
    super();
    this.MAX_TIME_TO_PAY_MS = this.configService.getOrThrow<number>(
      'LOCATION_BOOKING_MAX_TIME_TO_PAY_MS',
    ); // 12 hours
  }
  forceCancelBooking(dto: ForceCancelBookingDto): Promise<LocationBookingResponseDto> {
    throw new Error('Method not implemented.');
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
      booking.targetId = dto.targetId;
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
    throw new Error('Deprecated');
  }

  payForBooking(dto: PayForBookingDto): Promise<LocationBookingResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const locationBookingRepository = LocationBookingRepository(em);

      // get the booking in question
      const booking = await locationBookingRepository.findOneOrFail({
        where: {
          id: dto.locationBookingId,
          createdById: dto.accountId,
        },
      });

      if (!booking.canStartPayment()) {
        throw new BadRequestException(
          'This booking cannot start payment process. It needs to be approved and not expired.',
        );
      }

      // initiate transfer of funds from creator account to escrow account
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

      // if code reaches here, it means the payment has been made successfully
      booking.referencedTransactionId = transaction.id;
      booking.status = LocationBookingStatus.PAYMENT_RECEIVED;

      await locationBookingRepository.save(booking);

      const updatedBooking =
        await this.locationBookingPayoutService.schedulePayoutBooking({
          locationBookingId: booking.id,
          entityManager: em,
        });

      return this.mapTo(LocationBookingResponseDto, updatedBooking);
    });
  }

  cancelBooking(dto: CancelBookingDto): Promise<LocationBookingResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const locationBookingRepository = LocationBookingRepository(em);
      const locationBookingConfigRepository =
        LocationBookingConfigRepository(em);

      const locationBooking = await locationBookingRepository
        .findOneOrFail({
          where: {
            id: dto.locationBookingId,
            createdById: dto.accountId,
          },
        })
        .then((res) => {
          if (!res.canBeCancelled()) {
            throw new BadRequestException(
              'You can only cancel this booking if it is in a cancellable status and the booking date is not in the past.',
            );
          }
          return res;
        });

      // refund booking amount to event creator if booking has been paid for
      if (locationBooking.status === LocationBookingStatus.PAYMENT_RECEIVED) {
        const bookingConfig =
          await locationBookingConfigRepository.findOneOrFail({
            where: {
              locationId: locationBooking.locationId,
            },
          });

        const bookingStartDate = locationBooking.getStartDate()!;
        const refundPercentage =
          bookingConfig.getRefundPercentage(bookingStartDate);

        const refundAmount = locationBooking.amountToPay * refundPercentage;

        const refundTransaction =
          await this.walletTransactionCoordinatorService.transferFromEscrowToAccount(
            {
              entityManager: em,
              destinationAccountId: dto.accountId,
              amount: refundAmount,
              currency: SupportedCurrency.VND,
            },
          );
        locationBooking.refundTransactionId = refundTransaction.id;
        locationBooking.refundedAmount = refundAmount;
        locationBooking.refundedAt = dayjs().toDate();
      }

      locationBooking.status = LocationBookingStatus.CANCELLED;
      locationBooking.cancellationReason = dto.cancellationReason;

      // update location booking
      return await locationBookingRepository
        .save(locationBooking)
        .then((res) => this.mapTo(LocationBookingResponseDto, res));
    });
  }

  processAndApproveBooking(
    dto: ProcessAndApproveBookingDto,
  ): Promise<LocationBookingResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const locationBookingRepository = LocationBookingRepository(em);

      // get the booking in question
      const booking = await locationBookingRepository.findOneOrFail({
        where: {
          id: dto.bookingId,
          location: {
            businessId: dto.accountId, // you can only process your locations
          },
        },
      });

      // status check
      if (!booking.canBeProcessed()) {
        throw new BadRequestException(
          'This booking cannot be processed. It is either already processed or cancelled.',
        );
      }

      // soft lock the booking for the max time to pay. After this time, the booking will be expired and the lock will be released.
      const now = new Date();
      booking.status = LocationBookingStatus.APPROVED;
      booking.softLockedUntil = dayjs(now)
        .add(this.MAX_TIME_TO_PAY_MS, 'milliseconds')
        .toDate();
      await locationBookingRepository.update(
        { id: booking.id },
        {
          status: booking.status,
          softLockedUntil: booking.softLockedUntil,
        },
      );
      const result = this.delayedMessageProvider.sendDelayedMessage({
        delayMs: this.MAX_TIME_TO_PAY_MS,
        routingKey: DelayedMessageKeys.LOCATION_BOOKING_SOFT_LOCK_EXPIRED,
        message: {
          locationBookingId: booking.id,
        },
      });

      if (!result) {
        throw new InternalServerErrorException(
          'Failed to send delayed message for location booking payment expired',
        );
      }

      // TODO reject all conflicting bookings
      const conflictingBookings =
        await locationBookingRepository.findConflictingBookings({
          locationId: booking.locationId,
          startDate: booking.getStartDate()!,
          endDate: booking.getEndDate()!,
        });
      await this.processAndRejectBooking({
        accountId: dto.accountId,
        bookingIds: conflictingBookings
          .filter((b) => b.id !== booking.id) // exclude the current booking (this avoids a transaction deadlock)
          .map((b) => b.id),
        entityManager: em,
      });

      // emit events for notifications
      this.eventEmitter.emit(
        BOOKING_APPROVED_EVENT,
        new BookingApprovedEvent(booking),
      );

      const updatedBooking = await locationBookingRepository.findOneOrFail({
        where: { id: booking.id },
      });

      return this.mapTo(LocationBookingResponseDto, updatedBooking);
    });
  }

  processAndRejectBooking(
    dto: ProcessAndRejectBookingDto,
  ): Promise<LocationBookingResponseDto[]> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const locationBookingRepository = LocationBookingRepository(em);

      // get all bookings in question
      const bookings = await locationBookingRepository.find({
        where: {
          id: In(dto.bookingIds),
          location: {
            businessId: dto.accountId, // you can only process your locations
          },
        },
      });

      // validate all bookings were found
      if (bookings.length !== dto.bookingIds.length) {
        const foundIds = bookings.map((b) => b.id);
        const missingIds = dto.bookingIds.filter(
          (id) => !foundIds.includes(id),
        );
        throw new BadRequestException(
          `One or more bookings not found or not accessible: ${missingIds.join(', ')}`,
        );
      }

      // status check for all bookings
      const invalidBookings = bookings.filter(
        (booking) => !booking.canBeProcessed(),
      );
      if (invalidBookings.length > 0) {
        throw new BadRequestException(
          `One or more bookings cannot be processed. They are either already processed or cancelled: ${invalidBookings.map((b) => b.id).join(', ')}`,
        );
      }

      // update status to REJECTED for all bookings
      bookings.forEach((booking) => {
        booking.status = LocationBookingStatus.REJECTED;
      });
      const updatedBookings = await locationBookingRepository.save(bookings);

      // emit events for notifications
      updatedBookings.forEach((booking) => {
        this.eventEmitter.emit(
          BOOKING_REJECTED_EVENT,
          new BookingRejectedEvent(booking.id),
        );
      });

      return this.mapToArray(LocationBookingResponseDto, updatedBookings);
    });
  }
}
