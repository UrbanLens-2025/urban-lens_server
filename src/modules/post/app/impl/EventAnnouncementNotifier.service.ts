import { EventAttendanceStatus } from '@/common/constants/EventAttendanceStatus.constant';
import { EventTicketOrderStatus } from '@/common/constants/EventTicketOrderStatus.constant';
import { NotificationTypes } from '@/common/constants/Notifications.constant';
import { CoreService } from '@/common/core/Core.service';
import { HandleEventAnnouncementDto } from '@/common/dto/posts/HandleEventAnnouncement.dto';
import { EventAttendanceRepository } from '@/modules/event/infra/repository/EventAttendance.repository';
import { TicketOrderRepository } from '@/modules/event/infra/repository/TicketOrder.repository';
import { IFirebaseNotificationService } from '@/modules/notification/app/IFirebaseNotification.service';
import { IEventAnnouncementNotifierService } from '@/modules/post/app/IEventAnnouncementNotifier.service';
import { AnnouncementRepository } from '@/modules/post/infra/repository/Announcement.repository';
import { ScheduledJobRepository } from '@/modules/scheduled-jobs/infra/repository/ScheduledJob.repository';
import { Inject, Injectable } from '@nestjs/common';
import { In } from 'typeorm';

@Injectable()
export class EventAnnouncementNotifierService
  extends CoreService
  implements IEventAnnouncementNotifierService
{
  constructor(
    @Inject(IFirebaseNotificationService)
    private readonly firebaseNotificationService: IFirebaseNotificationService,
  ) {
    super();
  }

  handleEventAnnouncement(dto: HandleEventAnnouncementDto): Promise<void> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const announcementRepo = AnnouncementRepository(em);
      const scheduledJobRepo = ScheduledJobRepository(em);
      const eventAttendanceRepo = EventAttendanceRepository(em);
      try {
        const announcement = await announcementRepo.findOne({
          where: {
            id: dto.announcementId,
          },
          relations: {
            event: true,
          },
        });

        if (!announcement || !announcement.event) {
          await scheduledJobRepo.updateToFailed({
            jobIds: [dto.scheduledJobId],
          });
          return;
        }

        const event = announcement.event;

        // get all attendees of the event (ticket buyers)
        const eventAttendances = await eventAttendanceRepo.find({
          where: {
            eventId: event.id,
            status: In([
              EventAttendanceStatus.CREATED,
              EventAttendanceStatus.CHECKED_IN,
            ]),
          },
        });

        const uniqueOwnerIds = [
          ...new Set(eventAttendances.map((e) => e.ownerId)),
        ];

        const notificationPromises = uniqueOwnerIds
          .filter(Boolean)
          .map((ownerId) =>
            this.firebaseNotificationService.sendNotificationTo({
              toUserId: ownerId!,
              type: NotificationTypes.EVENT_ANNOUNCEMENT,
              context: {
                eventName: event.displayName,
                announcementContent:
                  announcement.title + ': ' + announcement.description,
              },
            }),
          );

        await Promise.allSettled(notificationPromises);
        await scheduledJobRepo.updateToCompleted({
          jobIds: [dto.scheduledJobId],
        });
      } catch (error) {
        await scheduledJobRepo.updateToFailed({
          jobIds: [dto.scheduledJobId],
        });
        throw error;
      }
    });
  }
}
