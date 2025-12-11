import { OnEvent } from '@nestjs/event-emitter';
import {
  type ScheduledJobPayload,
  ScheduledJobType,
} from '@/common/constants/ScheduledJobType.constant';
import { ScheduledJobWrapperDto } from '@/common/dto/scheduled-job/ScheduledJobWrapper.dto';
import { CoreService } from '@/common/core/Core.service';
import { Inject, Injectable } from '@nestjs/common';
import { IEventPayoutService } from '@/modules/event/app/IEventPayout.service';

@Injectable()
export class EventPayoutListener extends CoreService {
  constructor(
    @Inject(IEventPayoutService)
    private readonly eventPayoutService: IEventPayoutService,
  ) {
    super();
  }

  @OnEvent(ScheduledJobType.EVENT_PAYOUT)
  async handleEventPayoutEvent(
    dto: ScheduledJobWrapperDto<
      ScheduledJobPayload<typeof ScheduledJobType.EVENT_PAYOUT>
    >,
  ) {
    return this.eventPayoutService.handleEventPayout({
      eventId: dto.payload.eventId,
      scheduledJobId: dto.jobId,
    });
  }
}
