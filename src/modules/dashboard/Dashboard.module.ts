import { Module } from '@nestjs/common';
import { DashboardAdminController } from './interfaces/Dashboard.admin.controller';
import { DashboardOwnerController } from './interfaces/Dashboard.owner.controller';
import { IDashboardService } from './app/IDashboard.service';
import { DashboardService } from './app/impl/Dashboard.service';
import { AccountInfraModule } from '@/modules/account/infra/Account.infra.module';
import { BusinessInfraModule } from '@/modules/business/infra/Business.infra.module';
import { PostInfraModule } from '@/modules/post/infra/Post.infra.module';
import { EventInfraModule } from '@/modules/event/infra/event.infra.module';
import { WalletInfraModule } from '@/modules/wallet/infra/Wallet.infra.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationBookingEntity } from '@/modules/location-booking/domain/LocationBooking.entity';

@Module({
  imports: [
    AccountInfraModule,
    BusinessInfraModule,
    PostInfraModule,
    EventInfraModule,
    WalletInfraModule,
    TypeOrmModule.forFeature([LocationBookingEntity]),
  ],
  controllers: [DashboardAdminController, DashboardOwnerController],
  providers: [
    {
      provide: IDashboardService,
      useClass: DashboardService,
    },
  ],
  exports: [IDashboardService],
})
export class DashboardModule {}
