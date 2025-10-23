import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IPostService } from '../IPost.service';
import { PostRepository } from '@/modules/post/infra/repository/Post.repository';
import { CreatePostDto } from '@/common/dto/post/CreatePost.dto';
import { GetMyPostsQueryDto } from '@/common/dto/post/GetMyPostsQuery.dto';
import { AnalyticRepository } from '../../../analytic/infra/repository/Analytic.repository';
import {
  AnalyticEntity,
  AnalyticEntityType,
} from '@/modules/analytic/domain/Analytic.entity';
import {
  BaseService,
  PaginationParams,
  PaginationResult,
} from '@/common/services/base.service';
import { PostEntity, PostType } from '@/modules/post/domain/Post.entity';
import { ReactPostDto } from '@/common/dto/post/ReactPost.dto';
import { ReactRepository } from '@/modules/post/infra/repository/React.repository';
import {
  ReactEntity,
  ReactEntityType,
  ReactType,
} from '../../domain/React.entity';
import { DeletePostDto } from '@/common/dto/post/DeletePost.dto';
import { CommentRepository } from '../../infra/repository/Comment.repository';
import { CommentEntity } from '../../domain/Comment.entity';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { CheckInRepository } from '@/modules/business/infra/repository/CheckIn.repository';
import { FollowRepository } from '@/modules/account/infra/repository/Follow.repository';
import { FollowEntityType } from '@/modules/account/domain/Follow.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  POST_CREATED_EVENT,
  PostCreatedEvent,
} from '@/modules/gamification/domain/events/PostCreated.event';
import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';
import { EntityManager } from 'typeorm';

interface RawPost {
  post_postid: string;
  post_content: string;
  post_imageurls: string[];
  post_type: PostType;
  post_rating?: number;
  post_locationid?: string;
  post_eventid?: string;
  post_isverified: boolean;
  post_visibility?: string;
  post_createdat: Date;
  post_updatedat: Date;
  author_id: string;
  author_firstname: string;
  author_lastname: string;
  author_avatarurl: string;
  analytic_total_upvotes?: number;
  analytic_total_downvotes?: number;
  analytic_total_comments?: number;
  location_id?: string;
  location_name?: string;
  location_addressline?: string;
  location_latitude?: number;
  location_longitude?: number;
  location_imageurl?: string[];
}

@Injectable()
export class PostService
  extends BaseService<PostEntity>
  implements IPostService
{
  constructor(
    private readonly postRepository: PostRepository,
    private readonly analyticRepository: AnalyticRepository,
    private readonly reactRepository: ReactRepository,
    private readonly commentRepository: CommentRepository,
    private readonly checkInRepository: CheckInRepository,
    private readonly followRepository: FollowRepository,
    private readonly eventEmitter: EventEmitter2,
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {
    super(postRepository.repo);
  }

  // Helper methods
  private getPostSelectFields(): string[] {
    return [
      'post.post_id as post_postid',
      'post.content as post_content',
      'post.image_urls as post_imageurls',
      'post.type as post_type',
      'post.rating as post_rating',
      'post.location_id as post_locationid',
      'post.event_id as post_eventid',
      'post.is_verified as post_isverified',
      'post.visibility as post_visibility',
      'post.created_at as post_createdat',
      'post.updated_at as post_updatedat',
      'author.id as author_id',
      'author.first_name as author_firstname',
      'author.last_name as author_lastname',
      'author.avatar_url as author_avatarurl',
      'analytic.total_upvotes as analytic_total_upvotes',
      'analytic.total_downvotes as analytic_total_downvotes',
      'analytic.total_comments as analytic_total_comments',
      'location.id as location_id',
      'location.name as location_name',
      'location.address_line as location_addressline',
      'location.latitude as location_latitude',
      'location.longitude as location_longitude',
      'location.imageUrl as location_imageurl',
    ];
  }

  private mapRawPostToDto(
    rawPost: RawPost,
    currentUserReaction: ReactType | null = null,
    isFollowing: boolean = false,
  ): any {
    const result: any = {
      postId: rawPost.post_postid,
      content: rawPost.post_content,
      imageUrls: rawPost.post_imageurls,
      type: rawPost.post_type,
      isVerified: rawPost.post_isverified,
      visibility: rawPost.post_visibility || null,
      createdAt: rawPost.post_createdat,
      updatedAt: rawPost.post_updatedat,
      author: {
        id: rawPost.author_id,
        firstName: rawPost.author_firstname,
        lastName: rawPost.author_lastname,
        avatarUrl: rawPost.author_avatarurl,
        isFollow: isFollowing,
      },
      analytics: {
        totalUpvotes: rawPost.analytic_total_upvotes || 0,
        totalDownvotes: rawPost.analytic_total_downvotes || 0,
        totalComments: rawPost.analytic_total_comments || 0,
      },
      currentUserReaction,
    };

    // Add rating for review posts
    if (rawPost.post_type === PostType.REVIEW && rawPost.post_rating) {
      result.rating = rawPost.post_rating;
    }

    // Add location if exists
    if (rawPost.location_id) {
      result.location = {
        id: rawPost.location_id,
        name: rawPost.location_name,
        addressLine: rawPost.location_addressline,
        latitude: rawPost.location_latitude
          ? parseFloat(rawPost.location_latitude.toString())
          : null,
        longitude: rawPost.location_longitude
          ? parseFloat(rawPost.location_longitude.toString())
          : null,
        imageUrl: rawPost.location_imageurl || [],
      };
    }

    // Add eventId if exists
    if (rawPost.post_eventid) {
      result.eventId = rawPost.post_eventid;
    }

    return result;
  }

  private async getUserReactionsMap(
    postIds: string[],
    userId: string,
  ): Promise<Map<string, ReactType>> {
    if (postIds.length === 0) {
      return new Map();
    }

    const userReactions = await this.reactRepository.repo
      .createQueryBuilder('react')
      .where('react.entityId IN (:...postIds)', { postIds })
      .andWhere('react.entityType = :entityType', {
        entityType: ReactEntityType.POST,
      })
      .andWhere('react.authorId = :userId', { userId })
      .select(['react.entityId', 'react.type'])
      .getMany();

    return new Map(userReactions.map((r) => [r.entityId, r.type]));
  }

  private async getFollowStatusMap(
    authorIds: string[],
    currentUserId: string,
  ): Promise<Map<string, boolean>> {
    if (authorIds.length === 0) {
      return new Map();
    }

    const follows = await this.followRepository.repo
      .createQueryBuilder('follow')
      .where('follow.entityId IN (:...authorIds)', { authorIds })
      .andWhere('follow.entityType = :entityType', {
        entityType: FollowEntityType.USER,
      })
      .andWhere('follow.followerId = :currentUserId', { currentUserId })
      .select(['follow.entityId'])
      .getMany();

    return new Map(follows.map((f) => [f.entityId, true]));
  }

  private normalizePaginationParams(params: PaginationParams = {}): {
    page: number;
    limit: number;
    skip: number;
  } {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  private buildPaginationMeta(
    page: number,
    limit: number,
    total: number,
  ): PaginationResult<any>['meta'] {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  private async processPostsWithReactions(
    posts: RawPost[],
    currentUserId?: string,
  ): Promise<any[]> {
    if (!currentUserId) {
      return posts.map((post) => this.mapRawPostToDto(post, null, false));
    }

    const postIds = posts.map((post) => post.post_postid);
    const authorIds = [...new Set(posts.map((post) => post.author_id))];

    const [reactionMap, followMap] = await Promise.all([
      this.getUserReactionsMap(postIds, currentUserId),
      this.getFollowStatusMap(authorIds, currentUserId),
    ]);

    return posts.map((post) =>
      this.mapRawPostToDto(
        post,
        reactionMap.get(post.post_postid) || null,
        followMap.get(post.author_id) || false,
      ),
    );
  }

  async getBasicFeed(
    params: PaginationParams = {},
    currentUserId?: string,
  ): Promise<PaginationResult<any>> {
    try {
      const { page, limit, skip } = this.normalizePaginationParams(params);

      // Build query to get public posts
      const postsQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoin('post.author', 'author')
        .leftJoin(
          'analytic',
          'analytic',
          'analytic.entity_id::uuid = post.post_id AND analytic.entity_type = :analyticType',
          { analyticType: AnalyticEntityType.POST },
        )
        .leftJoin('locations', 'location', 'location.id = post.location_id')
        .where('post.visibility = :visibility OR post.visibility IS NULL', {
          visibility: 'public',
        })
        .andWhere('post.is_hidden = :isHidden', { isHidden: false })
        .select(this.getPostSelectFields())
        .orderBy('post.created_at', 'DESC')
        .offset(skip)
        .limit(limit);

      // Count total posts
      const countQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .where('post.visibility = :visibility OR post.visibility IS NULL', {
          visibility: 'public',
        })
        .andWhere('post.is_hidden = :isHidden', { isHidden: false });

      const [posts, total] = await Promise.all([
        postsQuery.getRawMany(),
        countQuery.getCount(),
      ]);

      const processedPosts = await this.processPostsWithReactions(
        posts,
        currentUserId,
      );

      return {
        data: processedPosts,
        meta: this.buildPaginationMeta(page, limit, total),
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getFollowingFeed(
    currentUserId: string,
    params: PaginationParams = {},
  ): Promise<PaginationResult<any>> {
    try {
      const { page, limit, skip } = this.normalizePaginationParams(params);

      // Get list of users that current user is following
      const followedUsers = await this.followRepository.repo.find({
        where: {
          followerId: currentUserId,
          entityType: FollowEntityType.USER,
        },
        select: ['entityId'],
      });

      const followedUserIds = followedUsers.map((f) => f.entityId);

      // If not following anyone, return empty result
      if (followedUserIds.length === 0) {
        return {
          data: [],
          meta: this.buildPaginationMeta(page, limit, 0),
        };
      }

      // Build query to get posts from followed users
      const postsQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoin('post.author', 'author')
        .leftJoin(
          'analytic',
          'analytic',
          'analytic.entity_id::uuid = post.post_id AND analytic.entity_type = :analyticType',
          { analyticType: AnalyticEntityType.POST },
        )
        .leftJoin('locations', 'location', 'location.id = post.location_id')
        .where('post.author_id IN (:...followedUserIds)', { followedUserIds })
        .andWhere('post.is_hidden = :isHidden', { isHidden: false })
        .andWhere(
          '(post.visibility = :public OR post.visibility = :followers OR post.visibility IS NULL)',
          { public: 'public', followers: 'followers' },
        )
        .select(this.getPostSelectFields())
        .orderBy('post.created_at', 'DESC')
        .offset(skip)
        .limit(limit);

      // Count total posts
      const countQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .where('post.author_id IN (:...followedUserIds)', { followedUserIds })
        .andWhere('post.is_hidden = :isHidden', { isHidden: false })
        .andWhere(
          '(post.visibility = :public OR post.visibility = :followers OR post.visibility IS NULL)',
          { public: 'public', followers: 'followers' },
        );

      const [posts, total] = await Promise.all([
        postsQuery.getRawMany(),
        countQuery.getCount(),
      ]);

      const processedPosts = await this.processPostsWithReactions(
        posts,
        currentUserId,
      );

      return {
        data: processedPosts,
        meta: this.buildPaginationMeta(page, limit, total),
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async createPost(dto: CreatePostDto): Promise<any> {
    try {
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
        const checkIn = await this.checkInRepository.repo.findOne({
          where: {
            userProfileId: dto.authorId,
            locationId: dto.locationId,
          },
        });
        isVerified = !!checkIn;
      }

      const result = await this.postRepository.repo.manager.transaction(
        async (transactionalEntityManager) => {
          // Confirm upload for images if provided
          if (dto.imageUrls && dto.imageUrls.length > 0) {
            await this.fileStorageService.confirmUpload(
              dto.imageUrls,
              transactionalEntityManager,
            );
          }

          // Confirm upload for videos if provided
          if (dto.videoIds && dto.videoIds.length > 0) {
            await this.fileStorageService.confirmUpload(
              dto.videoIds,
              transactionalEntityManager,
            );
          }

          const post = this.postRepository.repo.create({
            ...dto,
            isVerified,
          });
          const savedPost = await transactionalEntityManager.save(post);

          // Create post analytic
          const analytic = this.analyticRepository.repo.create({
            entityId: savedPost.postId,
            entityType: AnalyticEntityType.POST,
          });
          await transactionalEntityManager.save(analytic);

          // If this is a review post, update location/event analytics
          if (dto.type === PostType.REVIEW && dto.rating) {
            if (dto.locationId) {
              await this.updateEntityRating(
                dto.locationId,
                AnalyticEntityType.LOCATION,
                transactionalEntityManager,
              );
            }

            if (dto.eventId) {
              await this.updateEntityRating(
                dto.eventId,
                AnalyticEntityType.EVENT,
                transactionalEntityManager,
              );
            }
          }

          // Update user profile total counters
          if (dto.authorId) {
            const userProfileRepo =
              transactionalEntityManager.getRepository(UserProfileEntity);
            if (dto.type === PostType.BLOG) {
              await userProfileRepo.increment(
                { accountId: dto.authorId },
                'totalBlogs',
                1,
              );
            } else if (dto.type === PostType.REVIEW) {
              await userProfileRepo.increment(
                { accountId: dto.authorId },
                'totalReviews',
                1,
              );
            }
          }

          return savedPost;
        },
      );

      // Emit post created event for gamification
      if (dto.authorId) {
        const postCreatedEvent = new PostCreatedEvent();
        postCreatedEvent.postId = result.postId;
        postCreatedEvent.authorId = dto.authorId;
        postCreatedEvent.postType = dto.type;
        postCreatedEvent.isVerified = isVerified;
        this.eventEmitter.emit(POST_CREATED_EVENT, postCreatedEvent);
      }

      return result.postId;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  private async updateEntityRating(
    entityId: string,
    entityType: AnalyticEntityType,
    transactionalEntityManager: EntityManager,
  ): Promise<void> {
    const analyticRepo =
      transactionalEntityManager.getRepository(AnalyticEntity);
    const postRepo = transactionalEntityManager.getRepository(PostEntity);

    // Find or create analytic record for the entity
    let analytic = await analyticRepo.findOne({
      where: { entityId, entityType },
    });

    if (!analytic) {
      analytic = analyticRepo.create({
        entityId,
        entityType,
      });
      await analyticRepo.save(analytic);
    }

    const locationField =
      entityType === AnalyticEntityType.LOCATION ? 'locationId' : 'eventId';
    const reviews = await postRepo.find({
      where: {
        [locationField]: entityId,
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

  async getPostById(postId: string, userId?: string): Promise<any> {
    try {
      const post = await this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoin('post.author', 'author')
        .leftJoin(
          'analytic',
          'analytic',
          'analytic.entity_id::uuid = post.post_id AND analytic.entity_type = :type',
          { type: AnalyticEntityType.POST },
        )
        .leftJoin('locations', 'location', 'location.id = post.location_id')
        .where('post.post_id = :postId', { postId })
        .select(this.getPostSelectFields())
        .getRawOne();

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      let currentUserReaction: ReactType | null = null;
      let isFollowing = false;

      // Get user reaction and follow status if userId is provided
      if (userId) {
        const [userReaction, followStatus] = await Promise.all([
          this.reactRepository.repo.findOne({
            where: {
              entityId: postId,
              entityType: ReactEntityType.POST,
              authorId: userId,
            },
            select: ['type'],
          }),
          this.followRepository.repo.findOne({
            where: {
              followerId: userId,
              entityId: post.author_id,
              entityType: FollowEntityType.USER,
            },
          }),
        ]);

        if (userReaction) {
          currentUserReaction = userReaction.type;
        }

        if (followStatus) {
          isFollowing = true;
        }
      }

      return this.mapRawPostToDto(post, currentUserReaction, isFollowing);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async reactPost(dto: ReactPostDto): Promise<any> {
    try {
      const post = await this.postRepository.repo.findOne({
        where: { postId: dto.postId },
      });
      if (!post) {
        throw new NotFoundException('Post not found');
      }

      const react = await this.reactRepository.repo.findOne({
        where: {
          entityId: dto.postId,
          authorId: dto.userId,
          entityType: ReactEntityType.POST,
        },
      });

      let upvotesDelta = 0;
      let downvotesDelta = 0;

      if (react && react.type === dto.type) {
        await this.reactRepository.repo.delete(react.id);
        if (dto.type === ReactType.UPVOTE) upvotesDelta = -1;
        if (dto.type === ReactType.DOWNVOTE) downvotesDelta = -1;
      } else if (react && react.type !== dto.type) {
        await this.reactRepository.repo.update(react.id, { type: dto.type });
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
      } else {
        await this.reactRepository.repo.save(
          this.reactRepository.repo.create({
            entityId: dto.postId,
            entityType: ReactEntityType.POST,
            authorId: dto.userId,
            type: dto.type,
          }),
        );
        if (dto.type === ReactType.UPVOTE) upvotesDelta = +1;
        if (dto.type === ReactType.DOWNVOTE) downvotesDelta = +1;
      }
      await this.analyticRepository.repo.increment(
        { entityId: post.postId, entityType: AnalyticEntityType.POST },
        'totalUpvotes',
        upvotesDelta,
      );
      await this.analyticRepository.repo.increment(
        { entityId: post.postId, entityType: AnalyticEntityType.POST },
        'totalDownvotes',
        downvotesDelta,
      );

      return 'React post successfully';
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async deletePost(dto: DeletePostDto): Promise<any> {
    try {
      const post = await this.postRepository.repo.findOne({
        where: { postId: dto.postId },
        relations: ['author'],
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (!post.author || post.author.id !== dto.userId) {
        throw new ForbiddenException('You are not allowed to delete this post');
      }

      await this.postRepository.repo.manager.transaction(async (tx) => {
        await tx.delete(CommentEntity, { post: { postId: post.postId } });
        await tx.delete(ReactEntity, {
          entityId: post.postId,
          entityType: ReactEntityType.POST,
        });
        await tx.delete(AnalyticEntity, {
          entityId: post.postId,
          entityType: AnalyticEntityType.POST,
        });
        await tx.delete(PostEntity, { postId: post.postId });

        // If this was a review post, update location/event analytics
        if (post.type === PostType.REVIEW && post.rating) {
          if (post.locationId) {
            await this.updateEntityRating(
              post.locationId,
              AnalyticEntityType.LOCATION,
              tx,
            );
          }

          if (post.eventId) {
            await this.updateEntityRating(
              post.eventId,
              AnalyticEntityType.EVENT,
              tx,
            );
          }
        }

        // Decrement user profile counters
        const userProfileRepo = tx.getRepository(UserProfileEntity);
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

      return 'Post deleted successfully';
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getReactionsOfPost(
    postId: string,
    reactType: ReactType,
    params: PaginationParams = {},
  ): Promise<any> {
    try {
      const { page, limit, skip } = this.normalizePaginationParams(params);

      const queryBuilder = this.reactRepository.repo
        .createQueryBuilder('react')
        .leftJoin('react.author', 'author')
        .where('react.entityId = :postId', { postId })
        .andWhere('react.entityType = :entityType', {
          entityType: ReactEntityType.POST,
        })
        .andWhere('react.type = :type', { type: reactType })
        .select([
          'react.id',
          'react.entityId',
          'react.entityType',
          'react.type',
          'author.id',
          'author.firstName',
          'author.lastName',
          'author.avatarUrl',
        ])
        .offset(skip)
        .limit(limit);

      const [reactions, total] = await queryBuilder.getManyAndCount();
      const propertyName =
        reactType === ReactType.UPVOTE ? 'totalUpvotes' : 'totalDownvotes';

      return {
        [propertyName]: reactions.map((reaction) => reaction.author),
        meta: this.buildPaginationMeta(page, limit, total),
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getUpvotesOfPost(
    postId: string,
    params: PaginationParams = {},
  ): Promise<any> {
    return this.getReactionsOfPost(postId, ReactType.UPVOTE, params);
  }

  async getDownvotesOfPost(
    postId: string,
    params: PaginationParams = {},
  ): Promise<any> {
    return this.getReactionsOfPost(postId, ReactType.DOWNVOTE, params);
  }

  async getAllReactionsOfPost(postId: string): Promise<any> {
    try {
      const [upvotes, downvotes] = await Promise.all([
        this.getUpvotesOfPost(postId),
        this.getDownvotesOfPost(postId),
      ]);

      return {
        upvotes: upvotes.totalUpvotes,
        totalUpvotes: upvotes.total,
        downvotes: downvotes.totalDownvotes,
        totalDownvotes: downvotes.total,
        totalReactions: upvotes.total + downvotes.total,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getPostsByAuthorIdAndType(
    authorId: string,
    params: PaginationParams = {},
    currentUserId?: string,
    postType?: PostType,
  ): Promise<PaginationResult<any>> {
    try {
      const { page, limit, skip } = this.normalizePaginationParams(params);

      const postsQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoin('post.author', 'author')
        .leftJoin(
          'analytic',
          'analytic',
          'analytic.entity_id::uuid = post.post_id AND analytic.entity_type = :analyticType',
          { analyticType: AnalyticEntityType.POST },
        )
        .leftJoin('locations', 'location', 'location.id = post.location_id')
        .where('post.author_id = :authorId', { authorId });

      // Add type filter if specified
      if (postType) {
        postsQuery.andWhere('post.type = :postType', { postType });
      }

      postsQuery
        .select(this.getPostSelectFields())
        .orderBy('post.createdAt', 'DESC')
        .offset(skip)
        .limit(limit);

      const countQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .where('post.author_id = :authorId', { authorId });

      if (postType) {
        countQuery.andWhere('post.type = :postType', { postType });
      }

      const [posts, total] = await Promise.all([
        postsQuery.getRawMany(),
        countQuery.getCount(),
      ]);

      const processedPosts = await this.processPostsWithReactions(
        posts,
        currentUserId,
      );

      return {
        data: processedPosts,
        meta: this.buildPaginationMeta(page, limit, total),
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getMyPosts(
    authorId: string,
    filterQuery: GetMyPostsQueryDto,
    params: PaginationParams = {},
    currentUserId?: string,
  ): Promise<PaginationResult<any>> {
    try {
      const { page, limit, skip } = this.normalizePaginationParams(params);

      const postsQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoin('post.author', 'author')
        .leftJoin(
          'analytic',
          'analytic',
          'analytic.entity_id::uuid = post.post_id AND analytic.entity_type = :analyticType',
          { analyticType: AnalyticEntityType.POST },
        )
        .leftJoin('locations', 'location', 'location.id = post.location_id')
        .where('post.author_id = :authorId', { authorId });

      // Apply filters
      if (filterQuery.type) {
        postsQuery.andWhere('post.type = :postType', {
          postType: filterQuery.type,
        });
      }

      if (filterQuery.visibility) {
        postsQuery.andWhere('post.visibility = :visibility', {
          visibility: filterQuery.visibility,
        });
      }

      if (filterQuery.isVerified !== undefined) {
        postsQuery.andWhere('post.is_verified = :isVerified', {
          isVerified: filterQuery.isVerified,
        });
      }

      postsQuery
        .select(this.getPostSelectFields())
        .orderBy('post.created_at', 'DESC')
        .offset(skip)
        .limit(limit);

      const countQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .where('post.author_id = :authorId', { authorId });

      // Apply same filters to count query
      if (filterQuery.type) {
        countQuery.andWhere('post.type = :postType', {
          postType: filterQuery.type,
        });
      }

      if (filterQuery.visibility) {
        countQuery.andWhere('post.visibility = :visibility', {
          visibility: filterQuery.visibility,
        });
      }

      if (filterQuery.isVerified !== undefined) {
        countQuery.andWhere('post.is_verified = :isVerified', {
          isVerified: filterQuery.isVerified,
        });
      }

      const [posts, total] = await Promise.all([
        postsQuery.getRawMany(),
        countQuery.getCount(),
      ]);

      const processedPosts = await this.processPostsWithReactions(
        posts,
        currentUserId,
      );

      return {
        data: processedPosts,
        meta: this.buildPaginationMeta(page, limit, total),
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPostByAuthorId(
    authorId: string,
    params: PaginationParams = {},
    currentUserId?: string,
  ): Promise<PaginationResult<any>> {
    return this.getPostsByAuthorIdAndType(authorId, params, currentUserId);
  }

  async getReviewsByAuthorId(
    authorId: string,
    params: PaginationParams = {},
    currentUserId?: string,
  ): Promise<PaginationResult<any>> {
    return this.getPostsByAuthorIdAndType(
      authorId,
      params,
      currentUserId,
      PostType.REVIEW,
    );
  }

  async getBlogsByAuthorId(
    authorId: string,
    params: PaginationParams = {},
    currentUserId?: string,
  ): Promise<PaginationResult<any>> {
    return this.getPostsByAuthorIdAndType(
      authorId,
      params,
      currentUserId,
      PostType.BLOG,
    );
  }

  async getAllPosts(
    params: PaginationParams = {},
  ): Promise<PaginationResult<any>> {
    const { page, limit, skip } = this.normalizePaginationParams(params);

    const [data, total] = await this.postRepository.repo.findAndCount({
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
      relations: ['author'],
      select: {
        postId: true,
        content: true,
        type: true,
        rating: true,
        imageUrls: true,
        visibility: true,
        isVerified: true,
        isHidden: true,
        locationId: true,
        eventId: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        author: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          email: true,
        },
      },
    });

    return {
      data,
      meta: this.buildPaginationMeta(page, limit, total),
    };
  }

  async getReviews(
    locationId: string | undefined,
    eventId: string | undefined,
    params: PaginationParams = {},
    currentUserId?: string,
  ): Promise<PaginationResult<any>> {
    try {
      if (!locationId && !eventId) {
        throw new BadRequestException(
          'Either locationId or eventId is required',
        );
      }

      const { page, limit, skip } = this.normalizePaginationParams(params);

      // Build posts query
      const postsQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoin('post.author', 'author')
        .leftJoin(
          'analytic',
          'analytic',
          'analytic.entity_id::uuid = post.post_id AND analytic.entity_type = :analyticType',
          { analyticType: AnalyticEntityType.POST },
        )
        .leftJoin('locations', 'location', 'location.id = post.location_id')
        .where('post.type = :type', { type: PostType.REVIEW })
        .andWhere('post.is_hidden = :isHidden', { isHidden: false });

      // Add location/event filters
      if (locationId && eventId) {
        postsQuery.andWhere(
          '(post.location_id = :locationId OR post.event_id = :eventId)',
          { locationId, eventId },
        );
      } else if (locationId) {
        postsQuery.andWhere('post.location_id = :locationId', { locationId });
      } else if (eventId) {
        postsQuery.andWhere('post.event_id = :eventId', { eventId });
      }

      postsQuery
        .select(this.getPostSelectFields())
        .orderBy('post.created_at', 'DESC')
        .offset(skip)
        .limit(limit);

      // Build count query
      const countQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .where('post.type = :type', { type: PostType.REVIEW })
        .andWhere('post.is_hidden = :isHidden', { isHidden: false });

      if (locationId && eventId) {
        countQuery.andWhere(
          '(post.location_id = :locationId OR post.event_id = :eventId)',
          { locationId, eventId },
        );
      } else if (locationId) {
        countQuery.andWhere('post.location_id = :locationId', { locationId });
      } else if (eventId) {
        countQuery.andWhere('post.event_id = :eventId', { eventId });
      }

      const [posts, total] = await Promise.all([
        postsQuery.getRawMany(),
        countQuery.getCount(),
      ]);

      const processedPosts = await this.processPostsWithReactions(
        posts,
        currentUserId,
      );

      return {
        data: processedPosts,
        meta: this.buildPaginationMeta(page, limit, total),
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPostsByLocation(
    locationId: string,
    params: PaginationParams = {},
    currentUserId?: string,
  ): Promise<PaginationResult<any>> {
    try {
      const { page, limit, skip } = this.normalizePaginationParams(params);

      // Build posts query
      const postsQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoin('post.author', 'author')
        .leftJoin(
          'analytic',
          'analytic',
          'analytic.entity_id::uuid = post.post_id AND analytic.entity_type = :analyticType',
          { analyticType: AnalyticEntityType.POST },
        )
        .leftJoin('locations', 'location', 'location.id = post.location_id')
        .where('post.location_id = :locationId', { locationId })
        .andWhere('post.is_hidden = :isHidden', { isHidden: false })
        .select(this.getPostSelectFields())
        .orderBy('post.created_at', 'DESC')
        .offset(skip)
        .limit(limit);

      // Build count query
      const countQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .where('post.location_id = :locationId', { locationId })
        .andWhere('post.is_hidden = :isHidden', { isHidden: false });

      const [posts, total] = await Promise.all([
        postsQuery.getRawMany(),
        countQuery.getCount(),
      ]);

      const processedPosts = await this.processPostsWithReactions(
        posts,
        currentUserId,
      );

      return {
        data: processedPosts,
        meta: this.buildPaginationMeta(page, limit, total),
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async updatePostVisibility(postId: string, isHidden: boolean): Promise<any> {
    try {
      const post = await this.postRepository.repo.findOne({
        where: { postId },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      await this.postRepository.repo.update({ postId }, { isHidden });

      return {
        message: `Post ${isHidden ? 'hidden' : 'shown'} successfully`,
        postId,
        isHidden,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }
}
