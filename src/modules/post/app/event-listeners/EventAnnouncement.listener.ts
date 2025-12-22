import {
  ScheduledJobPayload,
  ScheduledJobType,
} from '@/common/constants/ScheduledJobType.constant';
import { CoreService } from '@/common/core/Core.service';
import { ScheduledJobWrapperDto } from '@/common/dto/scheduled-job/ScheduledJobWrapper.dto';
import { IEventAnnouncementNotifierService } from '@/modules/post/app/IEventAnnouncementNotifier.service';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class EventAnnouncementListener extends CoreService {
  constructor(
    @Inject(IEventAnnouncementNotifierService)
    private readonly eventAnnouncementNotifierService: IEventAnnouncementNotifierService,
  ) {
    super();
  }

  @OnEvent(ScheduledJobType.EVENT_ANNOUNCEMENT)
  async handleEventAnnouncement(
    dto: ScheduledJobWrapperDto<
      ScheduledJobPayload<typeof ScheduledJobType.EVENT_ANNOUNCEMENT>
    >,
  ) {
    return this.eventAnnouncementNotifierService.handleEventAnnouncement({
      announcementId: dto.payload.announcementId,
      scheduledJobId: dto.jobId,
    });
  }
}
