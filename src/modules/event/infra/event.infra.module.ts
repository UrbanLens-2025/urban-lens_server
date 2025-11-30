import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { EventTicketEntity } from '@/modules/event/domain/EventTicket.entity';
import { EventTagsEntity } from '@/modules/event/domain/EventTags.entity';
import { TicketOrderEntity } from '@/modules/event/domain/TicketOrder.entity';
import { TicketOrderDetailsEntity } from '@/modules/event/domain/TicketOrderDetails.entity';
import { EventAttendanceEntity } from '@/modules/event/domain/EventAttendance.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      EventTicketEntity,
      EventTagsEntity,
      EventAttendanceEntity,
      TicketOrderEntity,
      TicketOrderDetailsEntity,
    ]),
  ],
})
export class EventInfraModule {}
