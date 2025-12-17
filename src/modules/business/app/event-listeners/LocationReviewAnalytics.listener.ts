import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CoreService } from '@/common/core/Core.service';
import {
  POST_CREATED_EVENT,
  PostCreatedEvent,
} from '@/modules/gamification/domain/events/PostCreated.event';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { PostType } from '@/modules/post/domain/Post.entity';
import { PostEntity } from '@/modules/post/domain/Post.entity';

@Injectable()
export class LocationReviewAnalyticsListener extends CoreService {
  @OnEvent(POST_CREATED_EVENT)
  async handlePostCreatedEvent(event: PostCreatedEvent) {
    return this.ensureTransaction(null, async (em) => {
      // Only process REVIEW posts
      if (event.postType !== PostType.REVIEW) {
        return;
      }

      // Get the post to check if it has a locationId
      const postRepo = em.getRepository(PostEntity);
      const post = await postRepo.findOne({
        where: { postId: event.postId },
        select: ['postId', 'locationId', 'type'],
      });

      if (!post || !post.locationId) {
        return;
      }

      // Increment totalReviews directly on location
      const locationRepo = em.getRepository(LocationEntity);
      await locationRepo.increment({ id: post.locationId }, 'totalReviews', 1);
    });
  }
}
