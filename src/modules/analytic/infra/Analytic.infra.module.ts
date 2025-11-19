import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticEntity } from '../domain/Analytic.entity';
import { Module } from '@nestjs/common';
import { AnalyticRepository } from './repository/Analytic.repository';
import { PostAnalyticsCreationSubscriber } from '@/modules/analytic/infra/subscriber/PostAnalyticsCreation.subscriber';
import { CommentAnalyticsCreationSubscriber } from '@/modules/analytic/infra/subscriber/CommentAnalyticsCreation.subscriber';
import { PostCommentCountUpdaterSubscriber } from '@/modules/analytic/infra/subscriber/PostCommentCountUpdater.subscriber';

const repositories = [AnalyticRepository];

@Module({
  imports: [TypeOrmModule.forFeature([AnalyticEntity])],
  providers: [
    ...repositories,
    PostAnalyticsCreationSubscriber,
    CommentAnalyticsCreationSubscriber,
    PostCommentCountUpdaterSubscriber,
  ],
  exports: repositories,
})
export class AnalyticInfraModule {}
