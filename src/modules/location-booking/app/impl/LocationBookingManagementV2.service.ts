import { LocationBookingStatus } from '@/common/constants/LocationBookingStatus.constant';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { CoreService } from '@/common/core/Core.service';
import { CancelBookingDto } from '@/common/dto/location-booking/CancelBooking.dto';
import { CreateBookingForBusinessLocationDto } from '@/common/dto/location-booking/CreateBookingForBusinessLocation.dto';
import { PayForBookingDto } from '@/common/dto/location-booking/PayForBooking.dto';
import { ProcessAndApproveBookingDto } from '@/common/dto/location-booking/ProcessAndApproveBooking.dto';
import { ProcessAndRejectBookingDto } from '@/common/dto/location-booking/ProcessAndRejectBooking.dto';
import { ProcessBookingDto } from '@/common/dto/location-booking/ProcessBooking.dto';
import { ForceCancelBookingDto } from '@/common/dto/location-booking/ForceCancelBooking.dto';
import { LocationBookingResponseDto } from '@/common/dto/location-booking/res/LocationBooking.response.dto';
import { LocationBookingRepository } from '@/modules/location-booking/infra/repository/LocationBooking.repository';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { ILocationBookingManagementService } from '@/modules/location-booking/app/ILocationBookingManagement.service';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';
import { LocationBookingDateEntity } from '@/modules/location-booking/domain/LocationBookingDate.entity';
import { IWalletTransactionCoordinatorService } from '@/modules/wallet/app/IWalletTransactionCoordinator.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { In, UpdateResult } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  BOOKING_APPROVED_EVENT,
  BookingApprovedEvent,
} from '@/modules/location-booking/domain/event/BookingApproved.event';
import {
  BOOKING_REJECTED_EVENT,
  BookingRejectedEvent,
} from '@/modules/location-booking/domain/event/BookingRejected.event';
import { LocationBookingConfigRepository } from '@/modules/location-booking/infra/repository/LocationBookingConfig.repository';
import { LocationBookingConfigEntity } from '@/modules/location-booking/domain/LocationBookingConfig.entity';
import {
  BOOKING_CANCELLED_EVENT,
  BookingCancelledEvent,
} from '@/modules/location-booking/domain/event/BookingCancelled.event';
import { ILocationBookingPayoutService } from '@/modules/location-booking/app/ILocationBookingPayout.service';
import { ISystemConfigService } from '@/modules/utility/app/ISystemConfig.service';
import { SystemConfigKey } from '@/common/constants/SystemConfigKey.constant';
import {
  BOOKING_FORCE_CANCELLED_EVENT,
  BookingForceCancelledEvent,
} from '@/modules/location-booking/domain/event/BookingForceCancelled.event';
import { LocationBookingObject } from '@/common/constants/LocationBookingObject.constant';
import { IEventManagementService } from '@/modules/event/app/IEventManagement.service';
import { Role } from '@/common/constants/Role.constant';

@Injectable()
export class LocationBookingManagementV2Service
  extends CoreService
  implements ILocationBookingManagementService
{
  constructor(
    @Inject(IWalletTransactionCoordinatorService)
    private readonly walletTransactionCoordinatorService: IWalletTransactionCoordinatorService,
    @Inject(ILocationBookingPayoutService)
    private readonly locationBookingPayoutService: ILocationBookingPayoutService,
    @Inject(ISystemConfigService)
    private readonly systemConfigService: ISystemConfigService,
    @Inject(forwardRef(() => IEventManagementService))
    private readonly eventManagementService: IEventManagementService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  createBooking_ForBusinessLocation(
    dto: CreateBookingForBusinessLocationDto,
  ): Promise<LocationBookingResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const locationRepo = LocationRepositoryProvider(em);
      const locationBookingRepo = LocationBookingRepository(em);

      // get the location in question
      const location = await locationRepo.findOneOrFail({
        where: {
          id: dto.locationId,
        },
        relations: {
          bookingConfig: true,
        },
      });

      // check if location can be booked
      if (!location.canBeBooked()) {
        throw new BadRequestException(
          'This location has not been configured for bookings yet.',
        );
      }

      // calculate booking price
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
      booking.bookingConfigSnapshot = location.bookingConfig;
      booking.dates = dto.dates.map((d) =>
        this.mapTo_safe(LocationBookingDateEntity, {
          startDateTime: d.startDateTime,
          endDateTime: d.endDateTime,
        }),
      );

      return locationBookingRepo.save(booking).then(async (res) => {
        // deduct money from account
        const transaction =
          await this.walletTransactionCoordinatorService.coordinateTransferToEscrow(
            {
              entityManager: em,
              accountName: 'Booking payment',
              fromAccountId: dto.accountId,
              amountToTransfer: bookingPrice,
              currency: SupportedCurrency.VND,
              ipAddress: '',
              returnUrl: '',
              note:
                'Payment for booking #' +
                res.id +
                ' for location: ' +
                location.name +
                ' (ID: ' +
                location.id +
                ')',
            },
          );
        res.referencedTransactionId = transaction.id;
        return locationBookingRepo.save(res);
      });
    }).then((res) => this.mapTo(LocationBookingResponseDto, res));
  }

  processBooking(dto: ProcessBookingDto): Promise<UpdateResult> {
    throw new Error('Deprecated');
  }

  payForBooking(dto: PayForBookingDto): Promise<LocationBookingResponseDto> {
    throw new Error('Deprecated.');
  }

  cancelBooking(dto: CancelBookingDto): Promise<LocationBookingResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const locationBookingRepo = LocationBookingRepository(em);
      const locationBookingConfigRepo = LocationBookingConfigRepository(em);

      const booking = await locationBookingRepo.findOneOrFail({
        where: {
          id: dto.locationBookingId,
          createdById: dto.accountId,
        },
        relations: {
          dates: true,
          location: true,
        },
      });

      if (!booking.canBeCancelled()) {
        throw new BadRequestException(
          'This booking cannot be cancelled. It is either already cancelled or not in a cancellable status.',
        );
      }

      // if awaiting approval, refund 100%
      if (
        booking.status === LocationBookingStatus.AWAITING_BUSINESS_PROCESSING
      ) {
        const refundAmount = booking.amountToPay; // 100% refund
        const refundTransaction =
          await this.walletTransactionCoordinatorService.transferFromEscrowToAccount(
            {
              entityManager: em,
              destinationAccountId: dto.accountId,
              amount: refundAmount,
              currency: SupportedCurrency.VND,
              note:
                'Refund for booking #' +
                booking.id +
                ' for location: ' +
                booking.location.name +
                ' (ID: ' +
                booking.locationId +
                ')',
            },
          );
        booking.refundTransactionId = refundTransaction.id;
        booking.refundedAmount = refundAmount;
        booking.refundedAt = dayjs().toDate();
      }

      // if approved, refund based on location's booking policy fetched from the snapshot
      // if there's no snapshot, fallback to the default booking policy
      else if (booking.status === LocationBookingStatus.APPROVED) {
        const bookingConfig = booking.bookingConfigSnapshot
          ? new LocationBookingConfigEntity(booking.bookingConfigSnapshot)
          : await locationBookingConfigRepo.findOneOrFail({
              where: {
                locationId: booking.locationId,
              },
            });

        const refundPercentage = bookingConfig.getRefundPercentage(
          booking.getStartDate()!,
        );

        // refund to creator based on the refund percentage
        const refundAmount = booking.amountToPay * refundPercentage;
        const refundTransaction =
          await this.walletTransactionCoordinatorService.transferFromEscrowToAccount(
            {
              entityManager: em,
              destinationAccountId: dto.accountId,
              amount: refundAmount,
              currency: SupportedCurrency.VND,
              note:
                'Refund for booking #' +
                booking.id +
                ' for location: ' +
                booking.location.name +
                ' (ID: ' +
                booking.locationId +
                ')',
            },
          );
        booking.refundTransactionId = refundTransaction.id;
        booking.refundedAmount = refundAmount;
        booking.refundedAt = dayjs().toDate();

        // payout to host based on the payout percentage
        const payoutAmount = booking.amountToPay - refundAmount;
        const payoutTransaction =
          await this.walletTransactionCoordinatorService.transferFromEscrowToAccount(
            {
              entityManager: em,
              destinationAccountId: booking.location.businessId,
              amount: payoutAmount,
              currency: SupportedCurrency.VND,
            },
          );

        booking.businessPayoutTransactionId = payoutTransaction.id;
      }

      booking.status = LocationBookingStatus.CANCELLED;
      booking.cancellationReason = dto.cancellationReason;
      booking.cancelledBy = Role.EVENT_CREATOR;
      booking.cancelledAt = dayjs().toDate();
      return locationBookingRepo.save(booking);
    })
      .then((res) => {
        this.eventEmitter.emit(
          BOOKING_CANCELLED_EVENT,
          new BookingCancelledEvent(res.id),
        );
        return res;
      })
      .then((res) => this.mapTo(LocationBookingResponseDto, res));
  }

  forceCancelBooking(
    dto: ForceCancelBookingDto,
  ): Promise<LocationBookingResponseDto> {
    return (
      this.ensureTransaction(dto.entityManager, async (em) => {
        const locationBookingRepo = LocationBookingRepository(em);

        const booking = await locationBookingRepo.findOneOrFail({
          where: {
            id: dto.bookingId,
            location: {
              businessId: dto.accountId,
            },
          },
          relations: {
            location: true,
          },
        });

        // can only cancel booking if booking date is in the past and is in a cancellable status
        if (!booking.canBeForceCancelled()) {
          throw new BadRequestException(
            'This booking cannot be force cancelled. It is either not in a cancellable status or the booking date is not in the past.',
          );
        }

        // refund 100% of the booking amount to the creator
        const bookingAmount = booking.amountToPay;
        // fine the host for violating the contract
        const finePercentage =
          await this.systemConfigService.getSystemConfigValue(
            SystemConfigKey.LOCATION_BOOKING_FORCE_CANCELLATION_FINE_PERCENTAGE,
            em,
          );
        const fineAmount = bookingAmount * finePercentage.value;
        const totalAmountToRefund = bookingAmount + fineAmount;
        const refundTransaction =
          await this.walletTransactionCoordinatorService.transferFromEscrowToAccount(
            {
              entityManager: em,
              destinationAccountId: booking.createdById,
              amount: totalAmountToRefund,
              currency: SupportedCurrency.VND,
              note:
                'Refund for booking #' +
                booking.id +
                ' for location: ' +
                booking.location.name +
                ' (ID: ' +
                booking.locationId +
                ')',
            },
          );
        booking.refundTransactionId = refundTransaction.id;

        // process the parent based on the booking type
        switch (booking.bookingObject) {
          case LocationBookingObject.FOR_EVENT: {
            await this.eventManagementService.handleBookingForceCancelled({
              eventId: booking.targetId!,
            });
            break;
          }
          default: {
            throw new InternalServerErrorException('Unknown booking object.');
          }
        }

        // update booking status to cancelled
        booking.status = LocationBookingStatus.CANCELLED;
        booking.cancellationReason = dto.cancellationReason;
        booking.cancelledBy = Role.BUSINESS_OWNER;
        booking.cancelledAt = dayjs().toDate();

        return locationBookingRepo.save(booking);
      })
        // notify creator and host
        .then((res) => {
          this.eventEmitter.emit(
            BOOKING_FORCE_CANCELLED_EVENT,
            new BookingForceCancelledEvent(res.id),
          );
          return res;
        })
        .then((res) => this.mapTo(LocationBookingResponseDto, res))
    );
  }

  processAndApproveBooking(
    dto: ProcessAndApproveBookingDto,
  ): Promise<LocationBookingResponseDto> {
    return (
      this.ensureTransaction(null, async (em) => {
        const locationBookingRepo = LocationBookingRepository(em);

        const booking = await locationBookingRepo.findOneOrFail({
          where: {
            id: dto.bookingId,
            location: {
              businessId: dto.accountId,
            },
          },
        });

        if (!booking.canBeProcessed()) {
          throw new BadRequestException(
            'This booking cannot be processed. It is either already processed or cancelled.',
          );
        }

        booking.status = LocationBookingStatus.APPROVED;

        return locationBookingRepo.save(booking).then(async (res) => {
          // schedule payout for booking
          if (booking.amountToPay > 0) {
            const payout =
              await this.locationBookingPayoutService.schedulePayoutBooking({
                locationBookingId: booking.id,
                entityManager: em,
              });
            res.scheduledPayoutJobId = payout.scheduledPayoutJobId;
          }
          return res;
        });
      })
        // event emitter
        .then((res) => {
          this.eventEmitter.emit(
            BOOKING_APPROVED_EVENT,
            new BookingApprovedEvent(res),
          );
          return res;
        })
        .then((res) => this.mapTo(LocationBookingResponseDto, res))
    );
  }

  processAndRejectBooking(
    dto: ProcessAndRejectBookingDto,
  ): Promise<LocationBookingResponseDto[]> {
    return (
      this.ensureTransaction(null, async (em) => {
        const locationBookingRepo = LocationBookingRepository(em);

        const bookings = await locationBookingRepo.find({
          where: {
            id: In(dto.bookingIds),
            location: {
              businessId: dto.accountId,
            },
          },
          relations: {
            location: true,
          },
        });

        if (bookings.length !== dto.bookingIds.length) {
          const foundIds = bookings.map((b) => b.id);
          const missingIds = dto.bookingIds.filter(
            (id) => !foundIds.includes(id),
          );
          throw new BadRequestException(
            `One or more bookings not found or not accessible: ${missingIds.join(', ')}`,
          );
        }

        const invalidBookings = bookings.filter(
          (booking) => !booking.canBeProcessed(),
        );
        if (invalidBookings.length > 0) {
          throw new BadRequestException(
            'This booking cannot be processed. It is either already processed or cancelled.',
          );
        }

        // refund all bookings
        for (const booking of bookings) {
          const refundTransaction =
            await this.walletTransactionCoordinatorService.transferFromEscrowToAccount(
              {
                entityManager: em,
                destinationAccountId: booking.createdById,
                amount: booking.amountToPay,
                currency: SupportedCurrency.VND,
                note:
                  'Refund for booking #' +
                  booking.id +
                  ' for location: ' +
                  booking.location.name +
                  ' (ID: ' +
                  booking.locationId +
                  ')',
              },
            );
          booking.refundTransactionId = refundTransaction.id;
          booking.refundedAmount = booking.amountToPay;
          booking.refundedAt = dayjs().toDate();
          booking.status = LocationBookingStatus.REJECTED;
        }

        return locationBookingRepo.save(bookings).then(async (res) => {
          for (const booking of res) {
            switch (booking.bookingObject) {
              case LocationBookingObject.FOR_EVENT: {
                const eventId = booking.targetId;
                if (!eventId) {
                  throw new InternalServerErrorException(
                    'Event ID is required for event bookings.',
                  );
                }
                await this.eventManagementService.handleBookingRejected({
                  eventId: [eventId],
                  entityManager: em,
                });
                break;
              }
              default: {
                throw new InternalServerErrorException(
                  'Unknown booking object.',
                );
              }
            }
          }
          return res;
        });
      })
        // event emitter
        .then((res) => {
          this.eventEmitter.emit(
            BOOKING_REJECTED_EVENT,
            res.map((b) => new BookingRejectedEvent(b.id)),
          );
          return res;
        })
        .then((res) => this.mapToArray(LocationBookingResponseDto, res))
    );
  }
}
