import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  POST_BANNED_EVENT,
  PostBannedEvent,
} from '@/modules/post/domain/events/PostBanned.event';
import { CoreService } from '@/common/core/Core.service';
import { IEmailNotificationService } from '@/modules/notification/app/IEmailNotification.service';
import { IFirebaseNotificationService } from '@/modules/notification/app/IFirebaseNotification.service';
import { NotificationTypes } from '@/common/constants/Notifications.constant';
import { EmailTemplates } from '@/common/constants/EmailTemplates.constant';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { PostRepositoryProvider } from '@/modules/post/infra/repository/Post.repository';

@Injectable()
export class PostBannedListener extends CoreService {
  private readonly logger = new Logger(PostBannedListener.name);

  constructor(
    @Inject(IEmailNotificationService)
    private readonly emailNotificationService: IEmailNotificationService,
    @Inject(IFirebaseNotificationService)
    private readonly firebaseNotificationService: IFirebaseNotificationService,
  ) {
    super();
  }

  @OnEvent(POST_BANNED_EVENT)
  async handlePostBanned(event: PostBannedEvent) {
    return this.ensureTransaction(null, async (em) => {
      const accountRepository = AccountRepositoryProvider(em);
      const postRepository = PostRepositoryProvider(em);

      // Get author info
      const author = await accountRepository.findOne({
        where: { id: event.authorId },
        select: ['id', 'email', 'firstName', 'lastName'],
      });

      if (!author) {
        this.logger.warn(
          `PostBannedListener: Author not found for userId: ${event.authorId}`,
        );
        return;
      }

      // Get post info
      const post = await postRepository.findOne({
        where: { postId: event.postId },
        select: ['content', 'type'],
      });

      if (!post) {
        this.logger.warn(
          `PostBannedListener: Post not found for postId: ${event.postId}`,
        );
        return;
      }

      // Truncate post content for notification
      const postContent =
        post.content.length > 100
          ? post.content.substring(0, 100) + '...'
          : post.content;

      const reason = event.reason || 'Your post violated our community guidelines.';

      // Send email notification
      try {
        await this.emailNotificationService.sendEmail({
          to: author.email,
          template: EmailTemplates.POST_BANNED,
          context: {
            reason,
            postContent,
            postId: event.postId,
          },
        });
        this.logger.log(
          `PostBannedListener: Email sent to ${author.email} for post ${event.postId}`,
        );
      } catch (error) {
        this.logger.error(
          `PostBannedListener: Failed to send email to ${author.email}`,
          error,
        );
      }

      // Send FCM notification
      try {
        await this.firebaseNotificationService.sendNotificationTo({
          toUserId: author.id,
          type: NotificationTypes.POST_BANNED,
          context: {
            reason,
            postContent,
            postId: event.postId,
          },
        });
        this.logger.log(
          `PostBannedListener: FCM notification sent to user ${author.id} for post ${event.postId}`,
        );
      } catch (error) {
        this.logger.error(
          `PostBannedListener: Failed to send FCM notification to user ${author.id}`,
          error,
        );
      }
    });
  }
}

