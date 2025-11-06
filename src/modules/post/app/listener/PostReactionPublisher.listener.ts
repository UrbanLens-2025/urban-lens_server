import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ClientProxy } from '@nestjs/microservices';
import {
  POST_REACTED_EVENT,
  PostReactedEvent,
} from '@/modules/post/domain/events/PostReacted.event';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserTagsEntity } from '@/modules/account/domain/UserTags.entity';

@Injectable()
export class PostReactionPublisherListener {
  private readonly logger = new Logger(PostReactionPublisherListener.name);

  constructor(
    @Optional()
    @Inject('RABBITMQ_CLIENT')
    private readonly rabbitMQClient: ClientProxy | null,
    @InjectRepository(UserTagsEntity)
    private readonly userTagsRepo: Repository<UserTagsEntity>,
  ) {}

  @OnEvent(POST_REACTED_EVENT)
  async handlePostReacted(event: PostReactedEvent) {
    if (!this.rabbitMQClient) {
      this.logger.debug(
        'RabbitMQ not configured, skipping post reaction publish',
      );
      return;
    }

    try {
      // Get post author's tags
      const authorTags = await this.userTagsRepo.find({
        where: { accountId: event.postAuthorId },
        relations: ['tag'],
      });

      if (authorTags.length === 0) {
        this.logger.debug(
          `Post author ${event.postAuthorId} has no tags, skipping`,
        );
        return;
      }

      const tags = authorTags
        .filter((ut) => ut.tag && ut.tag.displayName)
        .map((ut) => ({
          id: ut.tag.id,
          name: ut.tag.displayName,
          groupName: ut.tag.groupName,
        }));

      if (tags.length === 0) {
        this.logger.debug(
          `Post author ${event.postAuthorId} has no valid tags, skipping`,
        );
        return;
      }

      const message = {
        reactorUserId: event.reactorUserId,
        postId: event.postId,
        postAuthorId: event.postAuthorId,
        reactType: event.reactType, // 'upvote' or 'downvote'
        locationId: event.locationId,
        tags, // tags of the post author
        timestamp: new Date().toISOString(),
      };

      this.rabbitMQClient.emit('user.post.reaction', message);

      this.logger.log(
        `📤 Published post reaction: User ${event.reactorUserId} ${event.reactType}d post by ${event.postAuthorId} (${tags.length} tags)`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish post reaction event: ${error.message}`,
        error.stack,
      );
    }
  }
}
