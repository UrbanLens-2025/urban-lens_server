import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  EVENT_ATTENDANCE_REFUNDED,
  EventAttendanceRefundedEvent,
} from '@/modules/event/domain/events/EventAttendanceRefunded.event';
import { CoreService } from '@/common/core/Core.service';
import { IEmailNotificationService } from '@/modules/notification/app/IEmailNotification.service';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { EmailTemplates } from '@/common/constants/EmailTemplates.constant';
import { IFirebaseNotificationService } from '@/modules/notification/app/IFirebaseNotification.service';
import { NotificationTypes } from '@/common/constants/Notifications.constant';
import { EventAttendanceRepository } from '@/modules/event/infra/repository/EventAttendance.repository';
import { In } from 'typeorm';
import { EventAttendanceEntity } from '@/modules/event/domain/EventAttendance.entity';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';

@Injectable()
export class EventAttendanceRefundedListener extends CoreService {
  constructor(
    @Inject(IEmailNotificationService)
    private readonly emailNotificationService: IEmailNotificationService,
    @Inject(IFirebaseNotificationService)
    private readonly firebaseNotificationService: IFirebaseNotificationService,
  ) {
    super();
  }

  @OnEvent(EVENT_ATTENDANCE_REFUNDED)
  handleEvent(event: EventAttendanceRefundedEvent) {
    return this.ensureTransaction(null, async (em) => {
      const accountRepository = AccountRepositoryProvider(em);
      const eventAttendanceRepository = EventAttendanceRepository(em);

      const eventAttendances = await eventAttendanceRepository.find({
        where: { id: In(event.eventAttendanceIds) },
        relations: { event: true },
      });

      // Group by ownerId
      const attendancesByOwner = new Map<string, EventAttendanceEntity[]>();
      const ownerIds: string[] = [];
      for (const attendance of eventAttendances) {
        if (!attendance.ownerId) continue;
        if (!attendancesByOwner.has(attendance.ownerId)) {
          ownerIds.push(attendance.ownerId);
        }
        const existing = attendancesByOwner.get(attendance.ownerId) ?? [];
        existing.push(attendance);
        attendancesByOwner.set(attendance.ownerId, existing);
      }

      // Batch fetch all accounts
      const accounts = await accountRepository.find({
        where: { id: In(ownerIds) },
      });
      const accountMap = new Map(accounts.map((a) => [a.id, a]));

      // Send notifications in parallel
      const notificationPromises: Promise<unknown>[] = [];

      for (const [ownerId, attendances] of attendancesByOwner) {
        const account = accountMap.get(ownerId);
        if (!account) continue;

        const ticketCount = attendances.length;
        const totalRefundedAmount = attendances.reduce(
          (sum, a) => sum + Number(a.refundedAmount ?? 0),
          0,
        );
        const eventName = attendances[0]?.event?.name ?? 'Event';
        const currency = SupportedCurrency.VND;

        notificationPromises.push(
          this.emailNotificationService.sendEmail({
            to: account.email,
            template: EmailTemplates.EVENT_ATTENDANCE_REFUNDED,
            context: {
              name: account.firstName ?? account.email,
              eventName,
              ticketCount,
              refundAmount: totalRefundedAmount.toLocaleString(),
              currency,
            },
          }),
        );

        notificationPromises.push(
          this.firebaseNotificationService.sendNotificationTo({
            toUserId: ownerId,
            type: NotificationTypes.EVENT_ATTENDANCE_REFUNDED,
            context: {
              eventName,
              ticketCount: ticketCount.toString(),
              refundAmount: totalRefundedAmount.toLocaleString(),
              currency,
            },
          }),
        );
      }

      await Promise.all(notificationPromises);
    });
  }
}
