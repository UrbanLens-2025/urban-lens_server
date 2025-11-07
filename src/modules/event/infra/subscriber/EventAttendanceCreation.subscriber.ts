import { EventAttendanceStatus } from '@/common/constants/EventAttendanceStatus.constant';

import { EventAttendanceEntity } from '@/modules/event/domain/EventAttendance.entity';
import { TicketOrderEntity } from '@/modules/event/domain/TicketOrder.entity';
import { EventAttendanceRepository } from '@/modules/event/infra/repository/EventAttendance.repository';
import { DataSource, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';

@Injectable()
export class EventAttendanceCreationSubscriber
  implements EntitySubscriberInterface<TicketOrderEntity>
{
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return TicketOrderEntity;
  }

  async afterInsert(event: InsertEvent<TicketOrderEntity>) {

    const eventAttendanceRepository = EventAttendanceRepository(event.manager);
    const accountRepository = AccountRepositoryProvider(event.manager);

    const ticketOrder = event.entity;
    if (!ticketOrder) return;

    const accountDetails = await accountRepository.findOneOrFail({
      where: {
        id: ticketOrder.createdById,
      }
    })

    const eventAttendances: EventAttendanceEntity[] = [];

    for (const orderDetail of ticketOrder.orderDetails) {
      const eventAttendance = new EventAttendanceEntity();
      eventAttendance.orderId = ticketOrder.id;
      eventAttendance.status = EventAttendanceStatus.CREATED;
      eventAttendance.eventId = ticketOrder.eventId;
      eventAttendance.ticketId = orderDetail.ticketId;
      eventAttendance.referencedTicketOrderId = ticketOrder.id;
      eventAttendance.ownerId = accountDetails.id;
      eventAttendance.ownerEmail = accountDetails.email;
      eventAttendance.ownerPhoneNumber = accountDetails.phoneNumber;
      eventAttendances.push(eventAttendance);
    }

    await eventAttendanceRepository.save(eventAttendances);
  }
}
