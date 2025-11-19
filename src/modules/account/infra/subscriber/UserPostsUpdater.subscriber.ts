import { UserProfileRepositoryProvider } from '@/modules/account/infra/repository/UserProfile.repository';
import { PostEntity, PostType } from '@/modules/post/domain/Post.entity';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, EntitySubscriberInterface, InsertEvent } from 'typeorm';

@Injectable()
export class UserPostsUpdaterSubscriber
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

    const userProfileRepository = UserProfileRepositoryProvider(event.manager);
    const userProfile = await userProfileRepository.findOneOrFail({
      where: {
        accountId: post.authorId,
      },
    });

    switch (post.type) {
      case PostType.BLOG:
        await userProfileRepository.incrementTotalBlogs(userProfile.accountId);
        break;
      case PostType.REVIEW:
        await userProfileRepository.incrementTotalReviews(
          userProfile.accountId,
        );
        break;
      default:
        throw new InternalServerErrorException(
          'Post type has not been set in UserPostsUpdaterSubscriber',
        );
    }
  }
}
