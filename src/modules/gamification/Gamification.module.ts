import { Module } from '@nestjs/common';
import { RewardPointController } from './interfaces/RewardPoint.controller';
import { RankController } from './interfaces/Rank.controller';
import { LocationMissionBusinessController } from './interfaces/LocationMission.business.controller';
import { LocationMissionUserController } from './interfaces/LocationMission.user.controller';
import { LocationVoucherBusinessController } from './interfaces/LocationVoucher.business.controller';
import { LocationVoucherUserController } from './interfaces/LocationVoucher.user.controller';
import { QRCodeScanUserController } from './interfaces/QRCodeScan.user.controller';
import { UserLocationProfileController } from './interfaces/UserLocationProfile.user.controller';
import { VoucherExchangeUserController } from './interfaces/VoucherExchange.user.controller';
import { IRewardPointService } from './app/IRewardPoint.service';
import { IRankService } from './app/IRank.service';
import { IUserPointsService } from './app/IUserPoints.service';
import { ILocationMissionService } from './app/ILocationMission.service';
import { ILocationVoucherService } from './app/ILocationVoucher.service';
import { IQRCodeScanService } from './app/IQRCodeScan.service';
import { ICheckInMissionService } from './app/ICheckInMission.service';
import { IMissionProgressService } from './app/IMissionProgress.service';
import { IUserLocationProfileService } from './app/IUserLocationProfile.service';
import { IVoucherExchangeService } from './app/IVoucherExchange.service';
import { RewardPointService } from './app/impl/RewardPoint.service';
import { RankService } from './app/impl/Rank.service';
import { UserPointsService } from './app/impl/UserPoints.service';
import { PointsRecalculationService } from './app/impl/PointsRecalculation.service';
import { LocationMissionService } from './app/impl/LocationMission.service';
import { LocationVoucherService } from './app/impl/LocationVoucher.service';
import { QRCodeScanService } from './app/impl/QRCodeScan.service';
import { CheckInMissionService } from './app/impl/CheckInMission.service';
import { MissionProgressService } from './app/impl/MissionProgress.service';
import { UserLocationProfileService } from './app/impl/UserLocationProfile.service';
import { VoucherExchangeService } from './app/impl/VoucherExchange.service';
import { GamificationInfraModule } from './infra/Gamification.infra.module';
import { PostCreatedListener } from './app/event-listeners/PostCreated.listener';
import { CommentCreatedListener } from './app/event-listeners/CommentCreated.listener';
import { CheckInCreatedListener } from './app/event-listeners/CheckInCreated.listener';
import { PostLikedListener } from './app/event-listeners/PostLiked.listener';
import { PostCommentedListener } from './app/event-listeners/PostCommented.listener';
import { EventJoinedListener } from './app/event-listeners/EventJoined.listener';
import { LocationFollowedListener } from './app/event-listeners/LocationFollowed.listener';
import { AccountInfraModule } from '@/modules/account/infra/Account.infra.module';
import { PostInfraModule } from '@/modules/post/infra/Post.infra.module';
import { BusinessInfraModule } from '@/modules/business/infra/Business.infra.module';

@Module({
  imports: [
    GamificationInfraModule,
    AccountInfraModule,
    PostInfraModule,
    BusinessInfraModule,
  ],
  controllers: [
    RewardPointController,
    RankController,
    LocationMissionBusinessController,
    LocationMissionUserController,
    LocationVoucherBusinessController,
    LocationVoucherUserController,
    QRCodeScanUserController,
    UserLocationProfileController,
    VoucherExchangeUserController,
  ],
  providers: [
    {
      provide: IRewardPointService,
      useClass: RewardPointService,
    },
    {
      provide: IRankService,
      useClass: RankService,
    },
    {
      provide: IUserPointsService,
      useClass: UserPointsService,
    },
    {
      provide: ILocationMissionService,
      useClass: LocationMissionService,
    },
    {
      provide: ILocationVoucherService,
      useClass: LocationVoucherService,
    },
    {
      provide: IQRCodeScanService,
      useClass: QRCodeScanService,
    },
    {
      provide: ICheckInMissionService,
      useClass: CheckInMissionService,
    },
    {
      provide: IMissionProgressService,
      useClass: MissionProgressService,
    },
    {
      provide: 'IUserLocationProfileService',
      useClass: UserLocationProfileService,
    },
    {
      provide: 'IVoucherExchangeService',
      useClass: VoucherExchangeService,
    },
    PointsRecalculationService,
    PostCreatedListener,
    CommentCreatedListener,
    CheckInCreatedListener,
    PostLikedListener,
    PostCommentedListener,
    EventJoinedListener,
    LocationFollowedListener,
  ],
  exports: [IRankService, IUserPointsService],
})
export class GamificationModule {}
