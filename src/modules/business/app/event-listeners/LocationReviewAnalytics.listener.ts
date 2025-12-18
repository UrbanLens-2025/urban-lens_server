import { Injectable, Logger } from '@nestjs/common';
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
import {
  POST_UNBANNED_EVENT,
  PostUnbannedEvent,
} from '@/modules/post/domain/events/PostUnbanned.event';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { PostType } from '@/modules/post/domain/Post.entity';
import { PostEntity } from '@/modules/post/domain/Post.entity';

@Injectable()
export class LocationReviewAnalyticsListener extends CoreService {
  private readonly logger = new Logger(LocationReviewAnalyticsListener.name);

  private get schema(): string {
    // Get schema from dataSource options
    return (this.dataSource.options as any).schema || 'development';
  }

  @OnEvent(POST_CREATED_EVENT)
  async handlePostCreatedEvent(event: PostCreatedEvent) {
    this.logger.log(
      `📢 Received POST_CREATED_EVENT for postId: ${event.postId}, type: ${event.postType}`,
    );

    try {
      // Only process REVIEW posts
      if (event.postType !== PostType.REVIEW) {
        this.logger.debug(
          `Skipping: post type is not REVIEW. type: ${event.postType}`,
        );
        return;
      }

      // Add a small delay to ensure transaction is fully committed
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the post to check if it has a locationId and is valid
      // Use dataSource directly to ensure we see committed data
      const postRepo = this.dataSource.getRepository(PostEntity);
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

      this.logger.log(
        `Post found: ${post ? 'yes' : 'no'}, locationId: ${post?.locationId}, type: ${post?.type}, isHidden: ${post?.isHidden}, visibility: ${post?.visibility}, rating: ${post?.rating}`,
      );

      if (!post || !post.locationId) {
        this.logger.warn(
          `Skipping: post not found or no locationId. postId: ${event.postId}`,
        );
        return;
      }

      // Only process if post is not hidden and is public (or visibility is null for reviews)
      if (post.isHidden === true) {
        this.logger.warn(`Skipping: post is hidden. postId: ${event.postId}`);
        return;
      }

      // Reviews should be public or null visibility (null means public for reviews)
      if (post.visibility && post.visibility !== 'public') {
        this.logger.warn(
          `Skipping: post visibility is not public/null. visibility: ${post.visibility}, postId: ${event.postId}`,
        );
        return;
      }

      // Only process if post has a rating
      if (!post.rating) {
        this.logger.warn(
          `Skipping: post has no rating. postId: ${event.postId}`,
        );
        return;
      }

      const locationRepo = this.dataSource.getRepository(LocationEntity);
      const locationId = post.locationId;

      this.logger.log(
        `Updating analytics for locationId: ${locationId} after post ${event.postId} was created`,
      );

      // Get current analytics values from location
      const currentLocation = await locationRepo.findOne({
        where: { id: locationId },
        select: ['totalReviews', 'averageRating'],
      });

      if (!currentLocation) {
        this.logger.warn(
          `Location ${locationId} not found. Skipping analytics update.`,
        );
        return;
      }

      const currentTotalReviews = currentLocation.totalReviews || 0;
      const currentAverageRating = currentLocation.averageRating || 0;
      const newRating = post.rating;

      // Calculate new values
      // New total = current + 1
      const newTotalReviews = currentTotalReviews + 1;

      // New average = (currentAverage * currentTotal + newRating) / newTotal
      const newAverageRating =
        currentTotalReviews === 0
          ? newRating
          : (currentAverageRating * currentTotalReviews + newRating) /
            newTotalReviews;

      this.logger.log(
        `Current: totalReviews=${currentTotalReviews}, averageRating=${currentAverageRating.toFixed(2)}`,
      );
      this.logger.log(
        `New: totalReviews=${newTotalReviews}, averageRating=${newAverageRating.toFixed(2)} (added rating: ${newRating})`,
      );

      // Update location with new values
      const updateResult = await locationRepo.update(
        { id: locationId },
        {
          totalReviews: newTotalReviews,
          averageRating: parseFloat(newAverageRating.toFixed(2)),
        },
      );

      this.logger.log(
        `Update result: affected=${updateResult.affected}, locationId=${locationId}`,
      );

      this.logger.log(
        `✅ Successfully updated location analytics for locationId: ${locationId} (${newTotalReviews} reviews, avg: ${newAverageRating.toFixed(2)})`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error handling POST_CREATED_EVENT for postId: ${event.postId}`,
        error.stack,
      );
      throw error;
    }
  }

  @OnEvent(POST_BANNED_EVENT)
  async handlePostBannedEvent(event: PostBannedEvent) {
    this.logger.log(
      `📢 Received POST_BANNED_EVENT for postId: ${event.postId}`,
    );

    try {
      // Get the post to check if it's a review with locationId
      // Use dataSource directly to ensure we see committed data
      const postRepo = this.dataSource.getRepository(PostEntity);
      const post = await postRepo.findOne({
        where: { postId: event.postId },
        select: ['postId', 'locationId', 'type', 'visibility', 'isHidden'],
      });

      this.logger.log(
        `Post found: ${post ? 'yes' : 'no'}, locationId: ${post?.locationId}, type: ${post?.type}, isHidden: ${post?.isHidden}, visibility: ${post?.visibility}`,
      );

      if (!post || !post.locationId || post.type !== PostType.REVIEW) {
        this.logger.warn(
          `Skipping: post not found or not a review with locationId. postId: ${event.postId}`,
        );
        return;
      }

      // Only process if post was previously valid (public or null visibility)
      // Reviews with null visibility are considered public
      if (!post.visibility || post.visibility === 'public') {
        const locationRepo = this.dataSource.getRepository(LocationEntity);
        const locationId = post.locationId;

        this.logger.log(
          `Updating analytics for locationId: ${locationId} after post ${event.postId} was banned`,
        );

        // Get the post's rating before it was banned
        const bannedPost = await this.dataSource
          .getRepository(PostEntity)
          .findOne({
            where: { postId: event.postId },
            select: ['rating'],
          });

        this.logger.log(
          `Banned post found: ${bannedPost ? 'yes' : 'no'}, rating: ${bannedPost?.rating}`,
        );

        if (!bannedPost) {
          this.logger.warn(
            `Post ${event.postId} not found. Skipping analytics update.`,
          );
          return;
        }

        if (!bannedPost.rating) {
          this.logger.warn(
            `Post ${event.postId} has no rating. Skipping analytics update.`,
          );
          return;
        }

        const removedRating = bannedPost.rating;

        // Get current analytics values from location
        const currentLocation = await locationRepo.findOne({
          where: { id: locationId },
          select: ['totalReviews', 'averageRating'],
        });

        if (!currentLocation) {
          this.logger.warn(
            `Location ${locationId} not found. Skipping analytics update.`,
          );
          return;
        }

        let currentTotalReviews = currentLocation.totalReviews || 0;
        let currentAverageRating =
          currentLocation.averageRating != null
            ? parseFloat(String(currentLocation.averageRating))
            : 0;

        // Ensure it's a valid number
        if (isNaN(currentAverageRating)) {
          currentAverageRating = 0;
        }

        this.logger.log(
          `Current location analytics: totalReviews=${currentTotalReviews}, averageRating=${currentAverageRating.toFixed(2)}`,
        );

        // If currentTotalReviews is 0, query from database to ensure accuracy
        // (might be 0 due to previous listener error)
        if (currentTotalReviews <= 0) {
          this.logger.log(
            `Current totalReviews is ${currentTotalReviews}, querying from database to ensure accuracy...`,
          );

          const [result] = await this.dataSource.query(
            `
            SELECT 
              COUNT(*) as total_reviews,
              AVG(rating) as average_rating
            FROM "${this.schema}"."posts"
            WHERE location_id = $1 
              AND type = 'REVIEW'
              AND rating IS NOT NULL
              AND (is_hidden = false OR is_hidden IS NULL)
              AND (visibility = 'public' OR visibility IS NULL)
            `,
            [locationId],
          );

          currentTotalReviews = parseInt(result.total_reviews, 10) || 0;
          currentAverageRating = result.average_rating
            ? parseFloat(String(result.average_rating))
            : 0;

          // Ensure it's a valid number
          if (isNaN(currentAverageRating)) {
            currentAverageRating = 0;
          }

          this.logger.log(
            `Queried from database: totalReviews=${currentTotalReviews}, averageRating=${currentAverageRating.toFixed(2)}`,
          );
        }

        // Validate: currentTotalReviews should be > 0
        if (currentTotalReviews <= 0) {
          this.logger.warn(
            `Current totalReviews is ${currentTotalReviews} after query. Cannot decrement. Skipping analytics update.`,
          );
          return;
        }

        // Calculate new values
        // New total = current - 1
        const newTotalReviews = Math.max(0, currentTotalReviews - 1);

        // New average calculation:
        // If removing the last review, set to 0
        // Otherwise: (currentAverage * currentTotal - removedRating) / newTotal
        const newAverageRating =
          newTotalReviews === 0
            ? 0
            : (currentAverageRating * currentTotalReviews - removedRating) /
              newTotalReviews;

        // Validate calculation
        if (isNaN(newAverageRating) || newAverageRating < 0) {
          this.logger.error(
            `Invalid averageRating calculated: ${newAverageRating}. Current: ${currentAverageRating}, Total: ${currentTotalReviews}, Removed: ${removedRating}`,
          );
          return;
        }

        this.logger.log(
          `New: totalReviews=${newTotalReviews}, averageRating=${newAverageRating.toFixed(2)} (removed rating: ${removedRating})`,
        );

        // Update location with new values
        const updateResult = await locationRepo.update(
          { id: locationId },
          {
            totalReviews: newTotalReviews,
            averageRating: parseFloat(newAverageRating.toFixed(2)),
          },
        );

        this.logger.log(
          `Update result: affected=${updateResult.affected}, locationId=${locationId}`,
        );

        this.logger.log(
          `✅ Successfully updated location analytics for locationId: ${locationId} (${newTotalReviews} reviews, avg: ${newAverageRating.toFixed(2)})`,
        );
      } else {
        this.logger.warn(
          `Skipping: post visibility is not public/null. visibility: ${post.visibility}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `❌ Error handling POST_BANNED_EVENT for postId: ${event.postId}`,
        error.stack,
      );
      throw error;
    }
  }

  @OnEvent(POST_UNBANNED_EVENT)
  async handlePostUnbannedEvent(event: PostUnbannedEvent) {
    this.logger.log(
      `📢 Received POST_UNBANNED_EVENT for postId: ${event.postId}`,
    );

    try {
      // Add a small delay to ensure transaction is fully committed
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get the post to check if it's a review with locationId
      // Use dataSource directly to ensure we see committed data
      const postRepo = this.dataSource.getRepository(PostEntity);
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

      this.logger.log(
        `Post found: ${post ? 'yes' : 'no'}, locationId: ${post?.locationId}, type: ${post?.type}, isHidden: ${post?.isHidden}, visibility: ${post?.visibility}, rating: ${post?.rating}`,
      );

      if (!post || !post.locationId || post.type !== PostType.REVIEW) {
        this.logger.warn(
          `Skipping: post not found or not a review with locationId. postId: ${event.postId}`,
        );
        return;
      }

      // Only process if post is now not hidden and is public (or visibility is null for reviews)
      if (post.isHidden === true) {
        this.logger.warn(
          `Skipping: post is still hidden. postId: ${event.postId}`,
        );
        return;
      }

      // Reviews should be public or null visibility (null means public for reviews)
      if (post.visibility && post.visibility !== 'public') {
        this.logger.warn(
          `Skipping: post visibility is not public/null. visibility: ${post.visibility}, postId: ${event.postId}`,
        );
        return;
      }

      // Only process if post has a rating
      if (!post.rating) {
        this.logger.warn(
          `Skipping: post has no rating. postId: ${event.postId}`,
        );
        return;
      }

      const locationRepo = this.dataSource.getRepository(LocationEntity);
      const locationId = post.locationId;

      this.logger.log(
        `Updating analytics for locationId: ${locationId} after post ${event.postId} was unbanned`,
      );

      // Get current analytics values from location
      const currentLocation = await locationRepo.findOne({
        where: { id: locationId },
        select: ['totalReviews', 'averageRating'],
      });

      if (!currentLocation) {
        this.logger.warn(
          `Location ${locationId} not found. Skipping analytics update.`,
        );
        return;
      }

      const currentTotalReviews = currentLocation.totalReviews || 0;
      let currentAverageRating =
        currentLocation.averageRating != null
          ? parseFloat(String(currentLocation.averageRating))
          : 0;

      // Ensure it's a valid number
      if (isNaN(currentAverageRating)) {
        currentAverageRating = 0;
      }

      const newRating = post.rating;

      // Calculate new values
      // New total = current + 1
      const newTotalReviews = currentTotalReviews + 1;

      // New average = (currentAverage * currentTotal + newRating) / newTotal
      const newAverageRating =
        currentTotalReviews === 0
          ? newRating
          : (currentAverageRating * currentTotalReviews + newRating) /
            newTotalReviews;

      this.logger.log(
        `Current: totalReviews=${currentTotalReviews}, averageRating=${currentAverageRating.toFixed(2)}`,
      );
      this.logger.log(
        `New: totalReviews=${newTotalReviews}, averageRating=${newAverageRating.toFixed(2)} (added rating: ${newRating})`,
      );

      // Update location with new values
      const updateResult = await locationRepo.update(
        { id: locationId },
        {
          totalReviews: newTotalReviews,
          averageRating: parseFloat(newAverageRating.toFixed(2)),
        },
      );

      this.logger.log(
        `Update result: affected=${updateResult.affected}, locationId=${locationId}`,
      );

      this.logger.log(
        `✅ Successfully updated location analytics for locationId: ${locationId} (${newTotalReviews} reviews, avg: ${newAverageRating.toFixed(2)})`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error handling POST_UNBANNED_EVENT for postId: ${event.postId}`,
        error.stack,
      );
      throw error;
    }
  }
}
