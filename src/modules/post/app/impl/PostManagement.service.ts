import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IPostManagementService } from '@/modules/post/app/IPostManagement.service';
import { DeletePostDto } from '@/common/dto/post/DeletePost.dto';
import { UpdatePostVisibilityDto } from '@/common/dto/post/UpdatePostVisibility.dto';
import { ReactPostDto } from '@/common/dto/post/ReactPost.dto';
import { ReactCommentRequestDto } from '@/common/dto/post/ReactComment.dto';
import { DeleteCommentRequestDto } from '@/common/dto/post/DeleteComment.dto';
import { PostRepositoryProvider } from '@/modules/post/infra/repository/Post.repository';
import { CommentRepositoryProvider } from '@/modules/post/infra/repository/Comment.repository';
import { PostEntity, PostType } from '@/modules/post/domain/Post.entity';
import { CommentEntity } from '@/modules/post/domain/Comment.entity';
import { ReactEntity, ReactEntityType, ReactType } from '@/modules/post/domain/React.entity';
import {
  AnalyticEntity,
  AnalyticEntityType,
} from '@/modules/analytic/domain/Analytic.entity';
import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';
import { LocationAnalyticsEntity } from '@/modules/business/domain/LocationAnalytics.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  POST_REACTED_EVENT,
  PostReactedEvent,
} from '@/modules/post/domain/events/PostReacted.event';

@Injectable()
export class PostManagementService
  extends CoreService
  implements IPostManagementService
{
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  async deletePost(dto: DeletePostDto): Promise<void> {
    const postRepository = PostRepositoryProvider(this.dataSource);
    const post = await postRepository.findOne({
      where: { postId: dto.postId },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (!post.author || post.author.id !== dto.userId) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }

    await this.ensureTransaction(null, async (em) => {
      await em.delete(CommentEntity, { post: { postId: post.postId } });
      await em.delete(ReactEntity, {
        entityId: post.postId,
        entityType: ReactEntityType.POST,
      });
      await em.delete(AnalyticEntity, {
        entityId: post.postId,
        entityType: AnalyticEntityType.POST,
      });
      await em.delete(PostEntity, { postId: post.postId });

      // If this was a review post, update location/event analytics
      if (post.type === PostType.REVIEW && post.rating) {
        if (post.locationId) {
          await this.updateEntityRating(
            post.locationId,
            AnalyticEntityType.LOCATION,
            em,
          );
        }

        if (post.eventId) {
          await this.updateEntityRating(
            post.eventId,
            AnalyticEntityType.EVENT,
            em,
          );
        }
      }

      // Decrement user profile counters
      const userProfileRepo = em.getRepository(UserProfileEntity);
      if (post.type === PostType.BLOG) {
        await userProfileRepo.decrement(
          { accountId: post.authorId },
          'totalBlogs',
          1,
        );
      } else if (post.type === PostType.REVIEW) {
        await userProfileRepo.decrement(
          { accountId: post.authorId },
          'totalReviews',
          1,
        );
      }
    });
  }

  private async updateEntityRating(
    entityId: string,
    entityType: AnalyticEntityType,
    em: any,
  ): Promise<void> {
    const postRepo = PostRepositoryProvider(em);

    // For LOCATION, update location_analytics table
    if (entityType === AnalyticEntityType.LOCATION) {
      const locationAnalyticsRepo = em.getRepository(LocationAnalyticsEntity);

      const reviews = await postRepo.find({
        where: {
          locationId: entityId,
          type: PostType.REVIEW,
        },
      });

      const totalReviews = reviews.length;
      let averageRating = 0;

      if (totalReviews > 0) {
        const totalRating = reviews.reduce(
          (sum, review) => sum + (review.rating || 0),
          0,
        );
        averageRating = parseFloat((totalRating / totalReviews).toFixed(2));
      }

      // Upsert location_analytics
      let locationAnalytics = await locationAnalyticsRepo.findOne({
        where: { locationId: entityId },
      });

      if (!locationAnalytics) {
        locationAnalytics = locationAnalyticsRepo.create({
          locationId: entityId,
          totalReviews,
          averageRating,
          totalPosts: 0,
          totalCheckIns: 0,
        });
      } else {
        locationAnalytics.totalReviews = totalReviews;
        locationAnalytics.averageRating = averageRating;
      }

      await locationAnalyticsRepo.save(locationAnalytics);
    }
    // For EVENT, keep using analytic table
    else if (entityType === AnalyticEntityType.EVENT) {
      const analyticRepo = em.getRepository(AnalyticEntity);

      let analytic = await analyticRepo.findOne({
        where: { entityId, entityType },
      });

      if (!analytic) {
        analytic = analyticRepo.create({
          entityId,
          entityType,
        });
      }

      const reviews = await postRepo.find({
        where: {
          eventId: entityId,
          type: PostType.REVIEW,
        },
      });

      analytic.totalReviews = reviews.length;

      if (reviews.length > 0) {
        const totalRating = reviews.reduce(
          (sum, review) => sum + (review.rating || 0),
          0,
        );
        const avgRating = totalRating / reviews.length;
        analytic.avgRating = parseFloat(avgRating.toFixed(2));
      } else {
        analytic.avgRating = 0;
      }

      await analyticRepo.save(analytic);
    }
  }

  async updatePostVisibility(dto: UpdatePostVisibilityDto): Promise<void> {
    const postRepository = PostRepositoryProvider(this.dataSource);
    const post = await postRepository.findOne({
      where: { postId: dto.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await postRepository.update({ postId: dto.postId }, { isHidden: dto.isHidden });
  }

  async reactPost(dto: ReactPostDto): Promise<void> {
    const postRepository = PostRepositoryProvider(this.dataSource);
    const post = await postRepository.findOne({
      where: { postId: dto.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const reactRepository = this.dataSource.getRepository(ReactEntity);
    const react = await reactRepository.findOne({
      where: {
        entityId: dto.postId,
        authorId: dto.userId,
        entityType: ReactEntityType.POST,
      },
    });

    let upvotesDelta = 0;
    let downvotesDelta = 0;
    let shouldEmitEvent = false;
    let finalReactType: ReactType | null = null;

    if (react && react.type === dto.type) {
      // User is removing their reaction
      await reactRepository.delete(react.id);
      if (dto.type === ReactType.UPVOTE) upvotesDelta = -1;
      if (dto.type === ReactType.DOWNVOTE) downvotesDelta = -1;
      finalReactType = null; // reaction removed
    } else if (react && react.type !== dto.type) {
      // User is changing their reaction
      await reactRepository.update(react.id, { type: dto.type });
      if (
        react.type === ReactType.UPVOTE &&
        dto.type === ReactType.DOWNVOTE
      ) {
        upvotesDelta = -1;
        downvotesDelta = +1;
      } else if (
        react.type === ReactType.DOWNVOTE &&
        dto.type === ReactType.UPVOTE
      ) {
        downvotesDelta = -1;
        upvotesDelta = +1;
      }
      shouldEmitEvent = true;
      finalReactType = dto.type;
    } else {
      // User is adding a new reaction
      await reactRepository.save(
        reactRepository.create({
          entityId: dto.postId,
          entityType: ReactEntityType.POST,
          authorId: dto.userId,
          type: dto.type,
        }),
      );
      if (dto.type === ReactType.UPVOTE) upvotesDelta = +1;
      if (dto.type === ReactType.DOWNVOTE) downvotesDelta = +1;
      shouldEmitEvent = true;
      finalReactType = dto.type;
    }

    const analyticRepository = this.dataSource.getRepository(AnalyticEntity);
    await analyticRepository.increment(
      { entityId: post.postId, entityType: AnalyticEntityType.POST },
      'totalUpvotes',
      upvotesDelta,
    );
    await analyticRepository.increment(
      { entityId: post.postId, entityType: AnalyticEntityType.POST },
      'totalDownvotes',
      downvotesDelta,
    );

    // Emit event for user behavior analysis (only if reaction was added/changed, not removed)
    if (shouldEmitEvent && finalReactType && post.authorId !== dto.userId) {
      const event = new PostReactedEvent();
      event.postId = dto.postId;
      event.postAuthorId = post.authorId;
      event.reactorUserId = dto.userId;
      event.reactType = finalReactType;
      event.locationId = post.locationId;
      this.eventEmitter.emit(POST_REACTED_EVENT, event);
    }
  }

  async reactComment(dto: ReactCommentRequestDto): Promise<void> {
    const commentRepository = CommentRepositoryProvider(this.dataSource);
    const comment = await commentRepository.findOne({
      where: { commentId: dto.commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const reactRepository = this.dataSource.getRepository(ReactEntity);
    const react = await reactRepository.findOne({
      where: { entityId: dto.commentId, authorId: dto.userId },
    });

    let upvotesDelta = 0;
    let downvotesDelta = 0;

    if (react && react.type === dto.type) {
      // Remove react
      await reactRepository.delete(react.id);
      if (dto.type === ReactType.UPVOTE) upvotesDelta = -1;
      if (dto.type === ReactType.DOWNVOTE) downvotesDelta = -1;
    } else if (react && react.type !== dto.type) {
      // Change react
      await reactRepository.update(react.id, { type: dto.type });
      if (react.type === ReactType.UPVOTE && dto.type === ReactType.DOWNVOTE) {
        upvotesDelta = -1;
        downvotesDelta = +1;
      } else if (
        react.type === ReactType.DOWNVOTE &&
        dto.type === ReactType.UPVOTE
      ) {
        downvotesDelta = -1;
        upvotesDelta = +1;
      }
    } else {
      // Add new react
      await reactRepository.save(
        reactRepository.create({
          entityId: dto.commentId,
          entityType: ReactEntityType.COMMENT,
          authorId: dto.userId,
          type: dto.type,
        }),
      );
      if (dto.type === ReactType.UPVOTE) upvotesDelta = +1;
      if (dto.type === ReactType.DOWNVOTE) downvotesDelta = +1;
    }

    // Update analytic
    const analyticRepository = this.dataSource.getRepository(AnalyticEntity);
    if (upvotesDelta !== 0) {
      await analyticRepository.increment(
        { entityId: comment.commentId, entityType: AnalyticEntityType.COMMENT },
        'totalUpvotes',
        upvotesDelta,
      );
    }
    if (downvotesDelta !== 0) {
      await analyticRepository.increment(
        { entityId: comment.commentId, entityType: AnalyticEntityType.COMMENT },
        'totalDownvotes',
        downvotesDelta,
      );
    }
  }

  async deleteComment(dto: DeleteCommentRequestDto): Promise<void> {
    const commentRepository = CommentRepositoryProvider(this.dataSource);
    const comment = await commentRepository.findOne({
      where: { commentId: dto.commentId },
      relations: ['author', 'post'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.author.id !== dto.userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }

    const postRepository = PostRepositoryProvider(this.dataSource);
    const post = await postRepository.findOne({
      where: { postId: comment.post.postId },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.author.id !== dto.userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }

    await this.ensureTransaction(null, async (em) => {
      const analyticRepository = em.getRepository(AnalyticEntity);
      const commentAnalytic = await analyticRepository.findOne({
        where: {
          entityId: dto.commentId,
          entityType: AnalyticEntityType.COMMENT,
        },
      });

      if (commentAnalytic) {
        await em.remove(commentAnalytic);
      }

      await em.remove(comment);

      // Decrease totalComments of post
      await analyticRepository.decrement(
        {
          entityId: comment.post.postId,
          entityType: AnalyticEntityType.POST,
        },
        'totalComments',
        1,
      );
    });
  }
}




