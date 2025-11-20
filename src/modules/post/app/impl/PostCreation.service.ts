import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CoreService } from '@/common/core/Core.service';
import { IPostCreationService } from '@/modules/post/app/IPostCreation.service';
import { CreatePostDto } from '@/common/dto/post/CreatePost.dto';
import { CreateCommentRequestDto } from '@/common/dto/post/CreateComment.dto';
import { CommentResponseDto } from '@/common/dto/post/res/CommentResponse.dto';
import { PostRepositoryProvider } from '@/modules/post/infra/repository/Post.repository';
import { CommentRepositoryProvider } from '@/modules/post/infra/repository/Comment.repository';
import { CheckInRepositoryProvider } from '@/modules/business/infra/repository/CheckIn.repository';
import { PostEntity, PostType } from '@/modules/post/domain/Post.entity';
import { CommentEntity } from '@/modules/post/domain/Comment.entity';
import {
  AnalyticEntity,
  AnalyticEntityType,
} from '@/modules/analytic/domain/Analytic.entity';
import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';
import { LocationAnalyticsEntity } from '@/modules/business/domain/LocationAnalytics.entity';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  POST_CREATED_EVENT,
  PostCreatedEvent,
} from '@/modules/gamification/domain/events/PostCreated.event';
import {
  COMMENT_CREATED_EVENT,
  CommentCreatedEvent,
} from '@/modules/gamification/domain/events/CommentCreated.event';
import { PostResponseDto } from '@/common/dto/post/res/PostResponse.dto';
import { CreateLocationReviewDto } from '@/common/dto/post/CreateLocationReview.dto';
import { CreateBlogDto } from '@/common/dto/post/CreateBlog.dto';
import { CreateEventReviewDto } from '@/common/dto/post/CreateEventReview.dto';
import { ReactCommentRequestDto } from '@/common/dto/post/ReactComment.dto';
import { ReactPostDto } from '@/common/dto/post/ReactPost.dto';
import { ReactRepositoryProvider } from '@/modules/post/infra/repository/React.repository';
import { ReactEntityType, ReactType } from '@/modules/post/domain/React.entity';

@Injectable()
export class PostCreationService
  extends CoreService
  implements IPostCreationService
{
  constructor(
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }
  createBlog(dto: CreateBlogDto): Promise<PostResponseDto> {
    const post = this.mapTo_safe(PostEntity, dto);
    post.turnIntoBlog();

    return this.ensureTransaction(null, async (em) => {
      const postRepository = PostRepositoryProvider(em);

      // upload media
      await this.fileStorageService.confirmUpload(
        [...(dto.imageUrls || []), ...(dto.videoIds || [])],
        em,
      );

      return postRepository.save(post);
      // ! log analytics is done using a typeorm subscriber in the ANALYTICS MODULE
    }) // emit event
      .then((savedPost) => {
        const postCreatedEvent = new PostCreatedEvent();
        postCreatedEvent.postId = savedPost.postId;
        postCreatedEvent.authorId = savedPost.authorId;
        postCreatedEvent.postType = savedPost.type;
        this.eventEmitter.emit(POST_CREATED_EVENT, postCreatedEvent);
        return savedPost;
      })
      .then((savedPost) => this.mapTo(PostResponseDto, savedPost));
  }

  createLocationReview(dto: CreateLocationReviewDto): Promise<PostResponseDto> {
    const post = this.mapTo_safe(PostEntity, dto);
    post.turnIntoLocationReview();

    return this.ensureTransaction(null, async (em) => {
      const postRepository = PostRepositoryProvider(em);
      const checkInRepository = CheckInRepositoryProvider(em);

      const checkIn = await checkInRepository.findOne({
        where: {
          userProfileId: dto.authorId,
          locationId: dto.locationId,
        },
      });

      post.isVerified = !!checkIn; // verified only if has checked in

      // upload media
      await this.fileStorageService.confirmUpload(
        [...(dto.imageUrls || []), ...(dto.videoIds || [])],
        em,
      );

      return postRepository.save(post).then(async (savedPost) => {
        // TODO recalculate rating here.
        await this.updateEntityRating(
          dto.locationId,
          AnalyticEntityType.LOCATION,
          em,
        );
        return savedPost;
      });
    })
      .then((savedPost) => {
        const postCreatedEvent = new PostCreatedEvent();
        postCreatedEvent.postId = savedPost.postId;
        postCreatedEvent.authorId = savedPost.authorId;
        postCreatedEvent.postType = savedPost.type;
        this.eventEmitter.emit(POST_CREATED_EVENT, postCreatedEvent);
        return savedPost;
      })
      .then((savedPost) => this.mapTo(PostResponseDto, savedPost));
  }

  createEventReview(dto: CreateEventReviewDto): Promise<PostResponseDto> {
    throw new Error('Method not implemented.');
  }

  private async updateEntityRating(
    entityId: string,
    entityType: AnalyticEntityType,
    em: EntityManager,
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

  async createComment(
    dto: CreateCommentRequestDto,
  ): Promise<CommentResponseDto> {
    const postRepository = PostRepositoryProvider(this.dataSource);
    const post = await postRepository
      .findOneOrFail({
        where: { postId: dto.postId },
      })
      .then((res) => {
        if (!res.canAddComments()) {
          throw new ForbiddenException('You cannot add comments to this post');
        }
        return res;
      });

    return (
      this.ensureTransaction(null, async (em) => {
        const commentRepository = CommentRepositoryProvider(em);
        const comment = this.mapTo_safe(CommentEntity, {
          ...dto,
          postId: post.postId,
        });
        return commentRepository.save(comment);
      })
        // Emit comment created event
        .then((savedComment) => {
          this.eventEmitter.emit(
            COMMENT_CREATED_EVENT,
            new CommentCreatedEvent(
              savedComment.commentId,
              dto.authorId,
              dto.postId,
            ),
          );

          return savedComment;
        })
        .then((savedComment) => this.mapTo(CommentResponseDto, savedComment))
    );
  }

  async addInteractionToPost(dto: ReactPostDto): Promise<void> {
    const postRepository = PostRepositoryProvider(this.dataSource);
    const post = await postRepository.findOneOrFail({
      where: { postId: dto.postId },
    });

    const reactRepository = ReactRepositoryProvider(this.dataSource);
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

  addInteractionToComment(dto: ReactCommentRequestDto): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
