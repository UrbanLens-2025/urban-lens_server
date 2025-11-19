import { AnalyticEntityType } from '@/modules/analytic/domain/Analytic.entity';
import { AnalyticRepositoryProvider } from '@/modules/analytic/infra/repository/Analytic.repository';
import { CommentEntity } from '@/modules/post/domain/Comment.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, EntitySubscriberInterface, InsertEvent } from 'typeorm';

@Injectable()
export class CommentAnalyticsCreationSubscriber
  implements EntitySubscriberInterface<CommentEntity>
{
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return CommentEntity;
  }

  async afterInsert(event: InsertEvent<CommentEntity>): Promise<void> {
    const comment = event.entity;
    if (!comment) return;

    const analyticRepository = AnalyticRepositoryProvider(event.manager);
    const analytic = analyticRepository.create({
      entityId: comment.commentId,
      entityType: AnalyticEntityType.COMMENT,
    });
    await analyticRepository.save(analytic);
  }
}
