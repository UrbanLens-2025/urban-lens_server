import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CoreService } from '@/common/core/Core.service';
import {
  POST_CREATED_EVENT,
  PostCreatedEvent,
} from '@/modules/gamification/domain/events/PostCreated.event';
import {
  POST_BANNED_EVENT,
  PostBannedEvent,
} from '@/modules/post/domain/events/PostBanned.event';
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

      // Get the post to check if it has a locationId and is valid
      const postRepo = em.getRepository(PostEntity);
      const post = await postRepo.findOne({
        where: { postId: event.postId },
        select: [
          'postId',
          'locationId',
          'type',
          'isHidden',
          'visibility',
          'rating',
        ],
      });

      if (!post || !post.locationId) {
        return;
      }

      // Only process if post is not hidden and is public (or visibility is null for reviews)
      if (post.isHidden === true) {
        return;
      }

      // Reviews should be public or null visibility (null means public for reviews)
      if (post.visibility && post.visibility !== 'public') {
        return;
      }

      // Only process if post has a rating
      if (!post.rating) {
        return;
      }

      const locationRepo = em.getRepository(LocationEntity);
      const locationId = post.locationId;

      // Recalculate totalReviews and averageRating from all valid reviews
      const [result] = await em.query(
        `
        SELECT 
          COUNT(*) as total_reviews,
          AVG(rating) as average_rating
        FROM posts
        WHERE location_id = $1 
          AND type = 'REVIEW'
          AND rating IS NOT NULL
          AND (is_hidden = false OR is_hidden IS NULL)
          AND (visibility = 'public' OR visibility IS NULL)
        `,
        [locationId],
      );

      const totalReviews = parseInt(result.total_reviews, 10);
      const averageRating = result.average_rating
        ? parseFloat(result.average_rating)
        : 0;

      // Update location with recalculated values
      await locationRepo.update(
        { id: locationId },
        {
          totalReviews,
          averageRating,
        },
      );
    });
  }

  @OnEvent(POST_BANNED_EVENT)
  async handlePostBannedEvent(event: PostBannedEvent) {
    return this.ensureTransaction(null, async (em) => {
      // Get the post to check if it's a review with locationId
      const postRepo = em.getRepository(PostEntity);
      const post = await postRepo.findOne({
        where: { postId: event.postId },
        select: ['postId', 'locationId', 'type', 'visibility'],
      });

      if (!post || !post.locationId || post.type !== PostType.REVIEW) {
        return;
      }

      // Only process if post was previously valid (public or null visibility)
      // Reviews with null visibility are considered public
      if (!post.visibility || post.visibility === 'public') {
        const locationRepo = em.getRepository(LocationEntity);
        const locationId = post.locationId;

        // Recalculate totalReviews and averageRating from remaining valid reviews
        // (post is already hidden, so it won't be counted in the query)
        const [result] = await em.query(
          `
          SELECT 
            COUNT(*) as total_reviews,
            AVG(rating) as average_rating
          FROM posts
          WHERE location_id = $1 
            AND type = 'REVIEW'
            AND rating IS NOT NULL
            AND (is_hidden = false OR is_hidden IS NULL)
            AND (visibility = 'public' OR visibility IS NULL)
          `,
          [locationId],
        );

        const totalReviews = parseInt(result.total_reviews, 10);
        const averageRating = result.average_rating
          ? parseFloat(result.average_rating)
          : 0;

        // Update location with recalculated values
        await locationRepo.update(
          { id: locationId },
          {
            totalReviews,
            averageRating,
          },
        );
      }
    });
  }
}
