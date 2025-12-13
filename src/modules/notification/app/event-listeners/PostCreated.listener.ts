import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  POST_CREATED_EVENT,
  PostCreatedEvent,
} from '@/modules/gamification/domain/events/PostCreated.event';
import { CoreService } from '@/common/core/Core.service';
import { IFirebaseNotificationService } from '@/modules/notification/app/IFirebaseNotification.service';
import { NotificationTypes } from '@/common/constants/Notifications.constant';
import { FollowEntityType } from '@/modules/account/domain/Follow.entity';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { PostRepositoryProvider } from '@/modules/post/infra/repository/Post.repository';
import { Visibility } from '@/modules/post/domain/Post.entity';
import { FollowEntity } from '@/modules/account/domain/Follow.entity';

@Injectable()
export class PostCreatedListener extends CoreService {
  private readonly logger = new Logger(PostCreatedListener.name);

  constructor(
    @Inject(IFirebaseNotificationService)
    private readonly firebaseNotificationService: IFirebaseNotificationService,
  ) {
    super();
  }

  @OnEvent(POST_CREATED_EVENT)
  async handlePostCreated(event: PostCreatedEvent) {
    return this.ensureTransaction(null, async (em) => {
      const followRepository = em.getRepository(FollowEntity);
      const accountRepository = AccountRepositoryProvider(em);
      const postRepository = PostRepositoryProvider(em);

      // Get author info
      const author = await accountRepository.findOne({
        where: { id: event.authorId },
        select: ['id', 'firstName', 'lastName'],
      });

      if (!author) {
        this.logger.warn(
          `PostCreatedListener: Author not found for userId: ${event.authorId}`,
        );
        return;
      }

      // Get post content and visibility (truncated for notification)
      const post = await postRepository.findOne({
        where: { postId: event.postId },
        select: ['content', 'type', 'visibility'],
      });

      if (!post) {
        this.logger.warn(
          `PostCreatedListener: Post not found for postId: ${event.postId}`,
        );
        return;
      }

      // Only send notifications for public posts or posts visible to followers
      // Skip private posts
      if (post.visibility === Visibility.PRIVATE) {
        this.logger.debug(
          `PostCreatedListener: Skipping notification for private post: ${event.postId}`,
        );
        return;
      }

      // Get all followers of the author
      const followers = await followRepository.find({
        where: {
          entityId: event.authorId,
          entityType: FollowEntityType.USER,
        },
        select: ['followerId'],
      });

      if (followers.length === 0) {
        this.logger.debug(
          `PostCreatedListener: No followers found for author: ${event.authorId}`,
        );
        return;
      }

      const authorName = `${author.firstName} ${author.lastName}`.trim();
      // Truncate post content to 100 characters for notification
      const postContent =
        post.content.length > 100
          ? post.content.substring(0, 100) + '...'
          : post.content;

      // Send notification to all followers
      const notificationPromises = followers.map((follower) =>
        this.firebaseNotificationService.sendNotificationTo({
          toUserId: follower.followerId,
          type: NotificationTypes.NEW_POST,
          context: {
            authorName,
            postContent,
            postId: event.postId,
            authorId: event.authorId,
          },
        }),
      );

      // Execute all notifications in parallel
      const results = await Promise.allSettled(notificationPromises);

      const successful = results.filter(
        (result) => result.status === 'fulfilled',
      ).length;
      const failed = results.filter(
        (result) => result.status === 'rejected',
      ).length;

      this.logger.log(
        `PostCreatedListener: Sent notifications to ${successful} followers, ${failed} failed for postId: ${event.postId}`,
      );

      // Log failures if any
      if (failed > 0) {
        const failures = results
          .filter((result) => result.status === 'rejected')
          .map((result) => result.reason);
        this.logger.warn(
          `PostCreatedListener: Failed to send ${failed} notifications`,
          failures,
        );
      }
    });
  }
}
