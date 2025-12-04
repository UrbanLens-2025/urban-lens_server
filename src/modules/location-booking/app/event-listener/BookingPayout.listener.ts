import { CoreService } from '@/common/core/Core.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ScheduledJobPayload,
  ScheduledJobType,
} from '@/common/constants/ScheduledJobType.constant';
import { ScheduledJobWrapperDto } from '@/common/dto/scheduled-job/ScheduledJobWrapper.dto';
import { ILocationBookingPayoutService } from '@/modules/location-booking/app/ILocationBookingPayout.service';

@Injectable()
export class BookingPayoutListener extends CoreService {
  private readonly logger = new Logger(BookingPayoutListener.name);

  constructor(
    @Inject(ILocationBookingPayoutService)
    private readonly locationBookingPayoutService: ILocationBookingPayoutService,
  ) {
    super();
  }

  @OnEvent(ScheduledJobType.LOCATION_BOOKING_PAYOUT)
  async handleLocationBookingPayoutEvent(
    dto: ScheduledJobWrapperDto<
      ScheduledJobPayload<typeof ScheduledJobType.LOCATION_BOOKING_PAYOUT>
    >,
  ) {
    this.logger.log(
      `Handling location booking payout for booking ID ${dto.payload.locationBookingId}`,
    );
    return this.locationBookingPayoutService.handlePayoutBooking({
      locationBookingId: dto.payload.locationBookingId,
      scheduledJobId: dto.jobId,
    });
  }
}
