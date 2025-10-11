import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { EventTicketEntity } from '@/modules/event/domain/EventTicket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity, EventTicketEntity])],
})
export class EventInfraModule {}
