import { Module } from '@nestjs/common';
import { EventInfraModule } from '@/modules/event/infra/event.infra.module';
import { FileStorageModule } from '@/modules/file-storage/FileStorage.module';
import { EventCreatorController } from '@/modules/event/interfaces/Event.creator.controller';
import { ICreateEventService } from '@/modules/event/app/ICreateEvent.service';
import { CreateEventService } from '@/modules/event/app/impl/CreateEvent.service';
import { IEventManagementService } from '@/modules/event/app/IEventManagement.service';
import { EventManagementService } from '@/modules/event/app/impl/EventManagement.service';
import { EventRequestCreatorController } from '@/modules/event/interfaces/EventRequest.creator.controller';
import { IEventRequestManagementService } from '@/modules/event/app/IEventRequestManagement.service';
import { EventRequestManagementService } from '@/modules/event/app/impl/EventRequestManagement.service';

@Module({
  imports: [EventInfraModule, FileStorageModule],
  controllers: [EventCreatorController, EventRequestCreatorController],
  providers: [
    {
      provide: ICreateEventService,
      useClass: CreateEventService,
    },
    {
      provide: IEventManagementService,
      useClass: EventManagementService,
    },
    {
      provide: IEventRequestManagementService,
      useClass: EventRequestManagementService,
    },
  ],
})
export class EventModule {}
