import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ClientProxy } from '@nestjs/microservices';
import {
  POST_CREATED_EVENT,
  PostCreatedEvent,
} from '@/modules/gamification/domain/events/PostCreated.event';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity, PostType } from '@/modules/post/domain/Post.entity';
import { LocationTagsEntity } from '@/modules/business/domain/LocationTags.entity';

@Injectable()
export class ReviewPostPublisherListener {
  private readonly logger = new Logger(ReviewPostPublisherListener.name);

  constructor(
    @Optional()
    @Inject('RABBITMQ_CLIENT')
    private readonly rabbitMQClient: ClientProxy | null,
    @InjectRepository(PostEntity)
    private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(LocationTagsEntity)
    private readonly locationTagsRepo: Repository<LocationTagsEntity>,
  ) {}

  @OnEvent(POST_CREATED_EVENT)
  async handlePostCreated(event: PostCreatedEvent) {
    this.logger.log(
      `🔔 Received POST_CREATED_EVENT: postId=${event.postId}, type=${event.postType}`,
    );

    if (!this.rabbitMQClient) {
      this.logger.debug(
        'RabbitMQ not configured, skipping review post publish',
      );
      return;
    }

    // Only process review posts
    if (event.postType !== PostType.REVIEW) {
      this.logger.debug(
        `Post type is ${event.postType}, not REVIEW. Skipping.`,
      );
      return;
    }

    this.logger.log(`✅ Processing REVIEW post: ${event.postId}`);

    try {
      // Get full post details including rating and locationId
      const post = await this.postRepo.findOne({
        where: { postId: event.postId },
        select: ['postId', 'authorId', 'locationId', 'rating'],
      });

      this.logger.log(
        `📝 Post details: ${JSON.stringify({ postId: post?.postId, authorId: post?.authorId, locationId: post?.locationId, rating: post?.rating })}`,
      );

      if (!post || !post.locationId || !post.rating) {
        this.logger.warn(
          `⚠️  Review post ${event.postId} missing locationId or rating, skipping`,
        );
        return;
      }

      // Get location's tags
      this.logger.log(`🔍 Fetching tags for location: ${post.locationId}`);
      const locationTags = await this.locationTagsRepo.find({
        where: { locationId: post.locationId },
        relations: ['tag'],
      });

      this.logger.log(
        `📊 Found ${locationTags.length} location tags for location ${post.locationId}`,
      );

      if (locationTags.length === 0) {
        this.logger.warn(
          `⚠️  Location ${post.locationId} has no tags, skipping`,
        );
        return;
      }

      const tags = locationTags
        .filter((lt) => lt.tag && lt.tag.displayName)
        .map((lt) => ({
          id: lt.tag.id,
          name: lt.tag.displayName,
          groupName: lt.tag.groupName,
        }));

      if (tags.length === 0) {
        this.logger.debug(
          `Location ${post.locationId} has no valid tags, skipping`,
        );
        return;
      }

      const message = {
        userId: post.authorId,
        postId: post.postId,
        locationId: post.locationId,
        rating: post.rating, // 1-5 stars
        tags, // tags of the location
        timestamp: new Date().toISOString(),
      };

      this.rabbitMQClient.emit('user.review.created', message);

      this.logger.log(
        `📤 Published review: User ${post.authorId} rated location ${post.locationId} with ${post.rating} stars (${tags.length} tags)`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish review post event: ${error.message}`,
        error.stack,
      );
    }
  }
}
