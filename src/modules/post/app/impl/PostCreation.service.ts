import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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

      return postRepository.save(post).then((savedPost) => {
        // recalculate rating here.
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

  async createPost(dto: CreatePostDto): Promise<string> {
    if (dto.type === PostType.BLOG && !dto.visibility) {
      throw new BadRequestException('Visibility is required for blog posts');
    }

    if (dto.type === PostType.REVIEW) {
      if (!dto.locationId && !dto.eventId) {
        throw new BadRequestException(
          'Review posts must have either locationId or eventId',
        );
      }
      if (!dto.rating) {
        throw new BadRequestException('Rating is required for review posts');
      }
    }

    // Clear rating for blog posts
    if (dto.type === PostType.BLOG) {
      dto.rating = undefined;
    }

    // Check if user has checked in at location (for review posts)
    let isVerified = false;
    if (dto.type === PostType.REVIEW && dto.locationId) {
      const checkInRepository = CheckInRepositoryProvider(this.dataSource);
      const checkIn = await checkInRepository.findOne({
        where: {
          userProfileId: dto.authorId,
          locationId: dto.locationId,
        },
      });
      isVerified = !!checkIn;
    }

    const result = await this.ensureTransaction(null, async (em) => {
      // Confirm upload for images if provided
      if (dto.imageUrls && dto.imageUrls.length > 0) {
        await this.fileStorageService.confirmUpload(dto.imageUrls, em);
      }

      // Confirm upload for videos if provided
      if (dto.videoIds && dto.videoIds.length > 0) {
        await this.fileStorageService.confirmUpload(dto.videoIds, em);
      }

      const postRepository = PostRepositoryProvider(em);
      const post = postRepository.create({
        ...dto,
        isVerified,
      });
      const savedPost = await postRepository.save(post);

      // Create post analytic
      // const analyticRepository = em.getRepository(AnalyticEntity);
      // const analytic = analyticRepository.create({
      //   entityId: savedPost.postId,
      //   entityType: AnalyticEntityType.POST,
      // });
      // await analyticRepository.save(analytic);

      // If this is a review post, update location/event analytics
      if (dto.type === PostType.REVIEW && dto.rating) {
        if (dto.locationId) {
          await this.updateEntityRating(
            dto.locationId,
            AnalyticEntityType.LOCATION,
            em,
          );
        }

        if (dto.eventId) {
          await this.updateEntityRating(
            dto.eventId,
            AnalyticEntityType.EVENT,
            em,
          );
        }
      }

      // Update user profile total counters
      // if (dto.authorId) {
      //   const userProfileRepo = em.getRepository(UserProfileEntity);
      //   if (dto.type === PostType.BLOG) {
      //     await userProfileRepo.increment(
      //       { accountId: dto.authorId },
      //       'totalBlogs',
      //       1,
      //     );
      //   } else if (dto.type === PostType.REVIEW) {
      //     await userProfileRepo.increment(
      //       { accountId: dto.authorId },
      //       'totalReviews',
      //       1,
      //     );
      //   }
      // }

      return savedPost;
    });

    // Emit post created event for gamification
    // if (dto.authorId) {
    //   const postCreatedEvent = new PostCreatedEvent();
    //   postCreatedEvent.postId = result.postId;
    //   postCreatedEvent.authorId = dto.authorId;
    //   postCreatedEvent.postType = dto.type;
    //   postCreatedEvent.isVerified = isVerified;
    //   this.eventEmitter.emit(POST_CREATED_EVENT, postCreatedEvent);
    // }

    return result.postId;
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

  async createComment(
    dto: CreateCommentRequestDto,
  ): Promise<CommentResponseDto> {
    const postRepository = PostRepositoryProvider(this.dataSource);
    const post = await postRepository.findOne({
      where: { postId: dto.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const result = await this.ensureTransaction(null, async (em) => {
      const commentRepository = CommentRepositoryProvider(em);
      const comment = commentRepository.create({
        author: { id: dto.authorId },
        post: { postId: dto.postId },
        content: dto.content,
      });
      const savedComment = await commentRepository.save(comment);

      // Create analytic for comment
      const analyticRepository = em.getRepository(AnalyticEntity);
      const analytic = analyticRepository.create({
        entityId: savedComment.commentId,
        entityType: AnalyticEntityType.COMMENT,
      });
      await analyticRepository.save(analytic);

      // Update totalComments of post
      await analyticRepository.increment(
        { entityId: dto.postId, entityType: AnalyticEntityType.POST },
        'totalComments',
        1,
      );

      return savedComment;
    });

    // Emit comment created event for gamification
    const commentCreatedEvent = new CommentCreatedEvent();
    commentCreatedEvent.commentId = result.commentId;
    commentCreatedEvent.authorId = dto.authorId ?? '';
    commentCreatedEvent.postId = dto.postId;
    this.eventEmitter.emit(COMMENT_CREATED_EVENT, commentCreatedEvent);

    return this.mapTo(CommentResponseDto, result);
  }
}
