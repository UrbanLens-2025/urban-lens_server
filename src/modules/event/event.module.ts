import { forwardRef, Module } from '@nestjs/common';
import { EventInfraModule } from '@/modules/event/infra/event.infra.module';
import { FileStorageModule } from '@/modules/file-storage/FileStorage.module';
import { LocationBookingModule } from '@/modules/location-booking/LocationBooking.module';
import { EventCreatorController } from '@/modules/event/interfaces/Event.creator.controller';
import { EventPublicController } from '@/modules/event/interfaces/Event.public.controller';
import { IEventQueryService } from '@/modules/event/app/IEventQuery.service';
import { EventQueryService } from '@/modules/event/app/impl/EventQuery.service';
import { IEventManagementService } from '@/modules/event/app/IEventManagement.service';
import { EventManagementService } from '@/modules/event/app/impl/EventManagement.service';
import { IEventTagsManagementService } from '@/modules/event/app/IEventTagsManagement.service';
import { EventTagsManagementService } from '@/modules/event/app/impl/EventTagsManagement.service';
import { IEventTicketManagementService } from '@/modules/event/app/IEventTicketManagement.service';
import { EventTicketManagementService } from '@/modules/event/app/impl/EventTicketManagement.service';
import { ITicketOrderManagementService } from '@/modules/event/app/ITicketOrderManagement.service';
import { TicketOrderManagementService } from '@/modules/event/app/impl/TicketOrderManagement.service';
import { ITicketOrderQueryService } from '@/modules/event/app/ITicketOrderQuery.service';
import { TicketOrderQueryService } from '@/modules/event/app/impl/TicketOrderQuery.service';
import { IEventAttendanceQueryService } from '@/modules/event/app/IEventAttendanceQuery.service';
import { EventAttendanceQueryService } from '@/modules/event/app/impl/EventAttendanceQuery.service';
import { EventUserController } from '@/modules/event/interfaces/Event.user.controller';
import { EventAdminController } from '@/modules/event/interfaces/Event.admin.controller';
import { WalletModule } from '@/modules/wallet/Wallet.module';
import { EventAttendanceManagementService } from '@/modules/event/app/impl/EventAttendanceManagement.service';
import { IEventAttendanceManagementService } from '@/modules/event/app/IEventAttendanceManagement.service';
import { ScheduledJobsModule } from '@/modules/scheduled-jobs/ScheduledJobs.module';
import { EventPayoutListener } from '@/modules/event/app/event-listeners/EventPayout.listener';
import { IEventAnalyticsService } from '@/modules/event/app/IEventAnalytics.service';
import { EventAnalyticsService } from '@/modules/event/app/impl/EventAnalytics.service';
import { EventAnalyticsDevOnlyController } from '@/modules/event/interfaces/EventAnalytics.dev-only.controller';
import { IEventPayoutService } from '@/modules/event/app/IEventPayout.service';
import { EventPayoutService } from '@/modules/event/app/impl/EventPayout.service';
import { UtilityModule } from '@/modules/utility/Utility.module';
import { EventOwnerController } from '@/modules/event/interfaces/Event.owner.controller';

@Module({
  imports: [
    WalletModule,
    EventInfraModule,
    FileStorageModule,
    FileStorageModule,
    ScheduledJobsModule,
    UtilityModule,
    forwardRef(() => LocationBookingModule),
  ],
  controllers: [
    EventCreatorController,
    EventPublicController,
    EventUserController,
    EventAdminController,
    EventAnalyticsDevOnlyController,
    EventOwnerController,
  ],
  providers: [
    {
      provide: IEventQueryService,
      useClass: EventQueryService,
    },
    {
      provide: IEventManagementService,
      useClass: EventManagementService,
    },
    {
      provide: IEventTagsManagementService,
      useClass: EventTagsManagementService,
    },
    {
      provide: IEventTicketManagementService,
      useClass: EventTicketManagementService,
    },
    {
      provide: ITicketOrderManagementService,
      useClass: TicketOrderManagementService,
    },
    {
      provide: ITicketOrderQueryService,
      useClass: TicketOrderQueryService,
    },
    {
      provide: IEventAttendanceQueryService,
      useClass: EventAttendanceQueryService,
    },
    {
      provide: IEventAttendanceManagementService,
      useClass: EventAttendanceManagementService,
    },
    {
      provide: IEventAnalyticsService,
      useClass: EventAnalyticsService,
    },
    {
      provide: IEventPayoutService,
      useClass: EventPayoutService,
    },
    EventPayoutListener,
  ],
  exports: [IEventManagementService, ITicketOrderManagementService],
})
export class EventModule {}
