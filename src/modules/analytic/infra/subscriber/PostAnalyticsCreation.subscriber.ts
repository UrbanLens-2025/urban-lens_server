import { AnalyticEntityType } from '@/modules/analytic/domain/Analytic.entity';
import { AnalyticRepositoryProvider } from '@/modules/analytic/infra/repository/Analytic.repository';
import { PostEntity } from '@/modules/post/domain/Post.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, EntitySubscriberInterface, InsertEvent } from 'typeorm';

@Injectable()
export class PostAnalyticsCreationSubscriber
  implements EntitySubscriberInterface<PostEntity>
{
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return PostEntity;
  }

  async afterInsert(event: InsertEvent<PostEntity>): Promise<void> {
    const post = event.entity;
    if (!post) return;

    const analyticRepository = AnalyticRepositoryProvider(event.manager);
    const analytic = analyticRepository.create({
      entityId: post.postId,
      entityType: AnalyticEntityType.POST,
    });
    await analyticRepository.save(analytic).then(async (savedAnalytic) => {
      // log analytics
    });
  }
}
