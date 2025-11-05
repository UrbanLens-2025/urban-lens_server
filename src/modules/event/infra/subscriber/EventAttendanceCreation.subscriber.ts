import { EventAttendanceStatus } from '@/common/constants/EventAttendanceStatus.constant';

import { EventAttendanceEntity } from '@/modules/event/domain/EventAttendance.entity';
import { TicketOrderEntity } from '@/modules/event/domain/TicketOrder.entity';
import { EventAttendanceRepository } from '@/modules/event/infra/repository/EventAttendance.repository';
import { DataSource, EntitySubscriberInterface, InsertEvent } from 'typeorm';
import { Injectable } from '@nestjs/common';

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
    const ticketOrder = event.entity;
    if (!ticketOrder) return;

    const eventAttendance = new EventAttendanceEntity();
    eventAttendance.orderId = ticketOrder.id;
    eventAttendance.status = EventAttendanceStatus.CREATED;

    const eventAttendanceRepository = EventAttendanceRepository(event.manager);
    await eventAttendanceRepository.save(eventAttendance);
  }
}
