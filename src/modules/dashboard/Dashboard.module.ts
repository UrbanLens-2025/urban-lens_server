import { Module } from '@nestjs/common';
import { DashboardAdminController } from './interfaces/Dashboard.admin.controller';
import { DashboardOwnerController } from './interfaces/Dashboard.owner.controller';
import { DashboardCreatorController } from './interfaces/Dashboard.creator.controller';
import { IDashboardService } from './app/IDashboard.service';
import { DashboardService } from './app/impl/Dashboard.service';
import { AccountInfraModule } from '@/modules/account/infra/Account.infra.module';
import { BusinessInfraModule } from '@/modules/business/infra/Business.infra.module';
import { PostInfraModule } from '@/modules/post/infra/Post.infra.module';
import { EventInfraModule } from '@/modules/event/infra/event.infra.module';
import { WalletInfraModule } from '@/modules/wallet/infra/Wallet.infra.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';
import { UtilityModule } from '@/modules/utility/Utility.module';
import { IRevenueAnalyticsService } from '@/modules/dashboard/app/IRevenueAnalytics.service';
import { RevenueAnalyticsService } from '@/modules/dashboard/app/impl/RevenueAnalytics.service';
import { IBusinessAnalyticsService } from '@/modules/dashboard/app/IBusinessAnalytics.service';
import { BusinessAnalyticsService } from '@/modules/dashboard/app/impl/BusinessAnalytics.service';

@Module({
  imports: [
    AccountInfraModule,
    BusinessInfraModule,
    PostInfraModule,
    EventInfraModule,
    WalletInfraModule,
    UtilityModule,
    TypeOrmModule.forFeature([LocationBookingEntity]),
  ],
  controllers: [
    DashboardAdminController,
    DashboardOwnerController,
    DashboardCreatorController,
  ],
  providers: [
    {
      provide: IDashboardService,
      useClass: DashboardService,
    },
    {
      provide: IRevenueAnalyticsService,
      useClass: RevenueAnalyticsService,
    },
    {
      provide: IBusinessAnalyticsService,
      useClass: BusinessAnalyticsService,
    },
  ],
  exports: [IDashboardService],
})
export class DashboardModule {}
