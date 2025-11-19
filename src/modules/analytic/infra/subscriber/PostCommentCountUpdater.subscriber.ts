import {
  AnalyticEntity,
  AnalyticEntityType,
} from '@/modules/analytic/domain/Analytic.entity';
import { AnalyticRepositoryProvider } from '@/modules/analytic/infra/repository/Analytic.repository';
import { CommentEntity } from '@/modules/post/domain/Comment.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, EntitySubscriberInterface, InsertEvent } from 'typeorm';

@Injectable()
export class PostCommentCountUpdaterSubscriber
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
    if (!comment || !comment.post) return;

    const analyticRepository = AnalyticRepositoryProvider(event.manager);

    const postId = comment.post.postId;

    if (postId) {
      await analyticRepository.increment(
        {
          entityId: postId,
          entityType: AnalyticEntityType.POST,
        },
        'totalComments',
        1,
      );
    } else {
      throw new InternalServerErrorException('Post ID is not set');
    }
  }
}
