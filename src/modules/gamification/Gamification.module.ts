import { Module } from '@nestjs/common';
import { RewardPointController } from './interfaces/RewardPoint.controller';
import { RankController } from './interfaces/Rank.controller';
import { IRewardPointService } from './app/IRewardPoint.service';
import { IRankService } from './app/IRank.service';
import { IUserPointsService } from './app/IUserPoints.service';
import { RewardPointService } from './app/impl/RewardPoint.service';
import { RankService } from './app/impl/Rank.service';
import { UserPointsService } from './app/impl/UserPoints.service';
import { PointsRecalculationService } from './app/impl/PointsRecalculation.service';
import { GamificationInfraModule } from './infra/Gamification.infra.module';
import { PostCreatedListener } from './app/event-listeners/PostCreated.listener';
import { CommentCreatedListener } from './app/event-listeners/CommentCreated.listener';
import { PostReactedListener } from './app/event-listeners/PostReacted.listener';
import { CheckInCreatedListener } from './app/event-listeners/CheckInCreated.listener';
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
  controllers: [RewardPointController, RankController],
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
    PointsRecalculationService,
    PostCreatedListener,
    CommentCreatedListener,
    PostReactedListener,
    CheckInCreatedListener,
  ],
  exports: [IRankService, IUserPointsService],
})
export class GamificationModule {}
