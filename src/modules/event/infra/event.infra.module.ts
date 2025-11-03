import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { EventTicketEntity } from '@/modules/event/domain/EventTicket.entity';
import { EventRequestEntity } from '@/modules/event/domain/EventRequest.entity';
import { EventRequestTagsEntity } from '@/modules/event/domain/EventRequestTags.entity';
import { EventTagsEntity } from '@/modules/event/domain/EventTags.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      EventTicketEntity,
      EventRequestEntity,
      EventRequestTagsEntity,
      EventTagsEntity,
    ]),
  ],
})
export class EventInfraModule {}
