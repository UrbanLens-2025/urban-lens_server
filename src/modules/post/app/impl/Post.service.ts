import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { IPostService } from '../IPost.service';
import { PostRepository } from '@/modules/post/infra/repository/Post.repository';
import { CreatePostDto } from '@/common/dto/post/CreatePost.dto';
import { UpdatePostDto } from '@/common/dto/post/UpdatePost.dto';
import { GetMyPostsQueryDto } from '@/common/dto/post/GetMyPostsQuery.dto';
import { AnalyticEntityType } from '@/common/constants/AnalyticEntityType.constant';
import {
  BaseService,
  PaginationParams,
  PaginationResult,
} from '@/common/services/base.service';
import {
  PostEntity,
  PostType,
  Visibility,
} from '@/modules/post/domain/Post.entity';
import { ReactPostDto } from '@/common/dto/post/ReactPost.dto';
import { ReactRepository } from '@/modules/post/infra/repository/React.repository';
import {
  ReactEntity,
  ReactEntityType,
  ReactType,
} from '../../domain/React.entity';
import { DeletePostDto } from '@/common/dto/post/DeletePost.dto';
import {
  PostResponseDto,
  PostAuthorResponseDto,
} from '@/common/dto/post/Post.response.dto';
import { ReactPostResponseDto } from '@/common/dto/post/ReactPost.response.dto';
import { DeletePostResponseDto } from '@/common/dto/post/DeletePost.response.dto';
import { UpdatePostVisibilityResponseDto } from '@/common/dto/post/UpdatePostVisibility.response.dto';
import { BanPostResponseDto } from '@/common/dto/post/BanPost.response.dto';
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
import {
  POST_REACTED_EVENT,
  PostReactedEvent,
} from '@/modules/post/domain/events/PostReacted.event';
import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { EntityManager } from 'typeorm';
import { UserProfileRepository } from '@/modules/account/infra/repository/UserProfile.repository';
import { LocationTagsRepository } from '@/modules/business/infra/repository/LocationTags.repository';
import { EventTagsRepository } from '@/modules/event/infra/repository/EventTags.repository';

interface RawPost {
  post_postid: string;
  post_content: string;
  post_imageurls: string[];
  post_type: PostType;
  post_rating?: number;
  post_locationid?: string;
  post_eventid?: string;
  post_isverified: boolean;
  post_is_hidden?: boolean;
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
  private readonly logger = new Logger(PostService.name);

  constructor(
    private readonly postRepository: PostRepository,
    private readonly reactRepository: ReactRepository,
    private readonly commentRepository: CommentRepository,
    private readonly checkInRepository: CheckInRepository,
    private readonly followRepository: FollowRepository,
    private readonly userProfileRepository: UserProfileRepository,
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
      'post.is_hidden as post_is_hidden',
      'post.visibility as post_visibility',
      'post.created_at as post_createdat',
      'post.updated_at as post_updatedat',
      'post.total_upvotes as analytic_total_upvotes',
      'post.total_downvotes as analytic_total_downvotes',
      'post.total_comments as analytic_total_comments',
      'account.id as author_id',
      'account.first_name as author_firstname',
      'account.last_name as author_lastname',
      'account.avatar_url as author_avatarurl',
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
  ): PostResponseDto {
    const result: PostResponseDto = {
      postId: rawPost.post_postid,
      content: rawPost.post_content,
      imageUrls: rawPost.post_imageurls,
      type: rawPost.post_type,
      isVerified: rawPost.post_isverified,
      visibility: (rawPost.post_visibility as Visibility) || null,
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
    if (
      rawPost.location_id &&
      rawPost.location_name &&
      rawPost.location_addressline
    ) {
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

  /**
   * Calculate relevance score for a post based on user preferences
   * Similar to Facebook's feed ranking algorithm
   */
  private async calculatePostRelevanceScore(
    post: RawPost,
    userTagScores: Record<string, number>,
    isFollowingAuthor: boolean,
  ): Promise<number> {
    let score = 10; // Base score

    // 1. Tag similarity score (0-100)
    const tagScore = await this.calculateTagSimilarityScore(
      post.post_locationid,
      post.post_eventid,
      userTagScores,
    );
    score += tagScore * 0.5; // Weight: 50%

    // 2. Follow bonus (0-50)
    if (isFollowingAuthor) {
      score += 50;
    }

    // 3. Engagement score (0-50)
    const engagementScore = this.calculateEngagementScore(
      post.analytic_total_upvotes || 0,
      post.analytic_total_comments || 0,
    );
    score += engagementScore;

    // 4. Recency score (0-30)
    const recencyScore = this.calculateRecencyScore(post.post_createdat);
    score += recencyScore;

    return score;
  }

  /**
   * Calculate tag similarity between user preferences and post's location/event tags
   */
  private async calculateTagSimilarityScore(
    locationId: string | undefined,
    eventId: string | undefined,
    userTagScores: Record<string, number>,
  ): Promise<number> {
    if (!locationId && !eventId) {
      return 0;
    }

    const locationTagsRepo = LocationTagsRepository(
      this.postRepository.repo.manager,
    );
    const eventTagsRepo = EventTagsRepository(this.postRepository.repo.manager);

    let postTagIds: number[] = [];

    // Get location tags
    if (locationId) {
      const locationTags = await locationTagsRepo.find({
        where: { locationId },
        select: ['tagId'],
      });
      postTagIds.push(...locationTags.map((lt) => lt.tagId));
    }

    // Get event tags
    if (eventId) {
      const eventTags = await eventTagsRepo.find({
        where: { eventId },
        select: ['tagId'],
      });
      postTagIds.push(...eventTags.map((et) => et.tagId));
    }

    if (postTagIds.length === 0) {
      return 0;
    }

    // Calculate similarity: sum of user tag scores for matching tags
    // Tag keys in userTagScores are in format "tag_<id>" (e.g., "tag_2", "tag_5")
    let similarity = 0;
    for (const tagId of postTagIds) {
      const tagKey = `tag_${tagId}`;
      if (userTagScores[tagKey]) {
        similarity += userTagScores[tagKey];
      }
    }

    // Normalize to 0-100 range
    const maxPossibleScore =
      Math.max(...Object.values(userTagScores), 1) * postTagIds.length;
    return maxPossibleScore > 0 ? (similarity / maxPossibleScore) * 100 : 0;
  }

  /**
   * Calculate engagement score based on upvotes and comments
   */
  private calculateEngagementScore(upvotes: number, comments: number): number {
    // Logarithmic scaling to prevent very popular posts from dominating
    const engagement = Math.log1p(upvotes + comments * 0.5);
    // Scale to 0-50 range
    return Math.min(engagement * 5, 50);
  }

  /**
   * Calculate recency score - newer posts get higher scores
   */
  private calculateRecencyScore(createdAt: Date): number {
    const now = new Date();
    const ageInDays =
      (now.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);

    // Posts older than 30 days get minimal score
    if (ageInDays > 30) {
      return 0;
    }

    // Linear decay: newer posts get higher scores
    return Math.max(0, (1 - ageInDays / 30) * 30);
  }

  private async processPostsWithReactions(
    posts: RawPost[],
    currentUserId?: string,
  ): Promise<PostResponseDto[]> {
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
  ): Promise<PaginationResult<PostResponseDto>> {
    try {
      const { page, limit, skip } = this.normalizePaginationParams(params);

      // Count total posts first
      const countQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .where('post.visibility = :visibility OR post.visibility IS NULL', {
          visibility: 'public',
        })
        .andWhere('post.is_hidden = :isHidden', { isHidden: false });

      const total = await countQuery.getCount();

      // For personalized feed, we need to fetch a larger batch, rank them, then paginate
      // For non-personalized feed, use standard pagination
      if (currentUserId) {
        return this.getPersonalizedFeed(params, currentUserId, total);
      } else {
        return this.getStandardFeed(params, total);
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Get standard feed (chronological order) for non-logged in users
   */
  private async getStandardFeed(
    params: PaginationParams,
    total: number,
  ): Promise<PaginationResult<PostResponseDto>> {
    const { page, limit, skip } = this.normalizePaginationParams(params);

    const selectFields = this.getPostSelectFields();
    const postsQuery = this.postRepository.repo
      .createQueryBuilder('post')
      .leftJoin('accounts', 'account', 'account.id = post.author_id')
      .leftJoin('locations', 'location', 'location.id = post.location_id')
      .where('post.visibility = :visibility OR post.visibility IS NULL', {
        visibility: 'public',
      })
      .andWhere('post.is_hidden = :isHidden', { isHidden: false });

    selectFields.forEach((field) => {
      postsQuery.addSelect(field);
    });

    postsQuery.orderBy('post.created_at', 'DESC').offset(skip).limit(limit);

    const posts = await postsQuery.getRawMany();

    // Filter out banned posts manually as a safety check
    const nonBannedPosts = posts.filter((post) => post.post_is_hidden !== true);

    if (nonBannedPosts.length !== posts.length) {
      this.logger.warn(
        `getStandardFeed: Found ${posts.length - nonBannedPosts.length} banned posts in query results`,
      );
    }

    const processedPosts = await this.processPostsWithReactions(nonBannedPosts);

    return {
      data: processedPosts,
      meta: this.buildPaginationMeta(page, limit, total),
    };
  }

  /**
   * Get personalized feed with ranking algorithm
   * Fetches a fixed large batch, ranks them once, then paginates
   * This ensures no duplicates across pages because we always rank the same set
   */
  private async getPersonalizedFeed(
    params: PaginationParams,
    currentUserId: string,
    total: number,
  ): Promise<PaginationResult<PostResponseDto>> {
    const { page, limit } = this.normalizePaginationParams(params);

    // Fetch a fixed large batch (always the same for consistency)
    // This prevents duplicates because every page request ranks the same posts
    const fixedFetchLimit = 1000; // Fetch up to 1000 most recent posts

    const selectFields = this.getPostSelectFields();
    const postsQuery = this.postRepository.repo
      .createQueryBuilder('post')
      .leftJoin('accounts', 'account', 'account.id = post.author_id')
      .leftJoin('locations', 'location', 'location.id = post.location_id')
      .where('post.visibility = :visibility OR post.visibility IS NULL', {
        visibility: 'public',
      })
      .andWhere('post.is_hidden = :isHidden', { isHidden: false });

    selectFields.forEach((field) => {
      postsQuery.addSelect(field);
    });

    // Always fetch the same set from the beginning (no offset)
    // This ensures consistency - same posts are ranked the same way every time
    postsQuery.orderBy('post.created_at', 'DESC').limit(fixedFetchLimit);

    const allPosts = await postsQuery.getRawMany();

    this.logger.debug(
      `getPersonalizedFeed: Fetched ${allPosts.length} posts, checking for banned posts`,
    );

    // Filter out banned posts manually as a safety check
    const nonBannedPosts = allPosts.filter(
      (post) => post.post_is_hidden !== true,
    );

    if (nonBannedPosts.length !== allPosts.length) {
      this.logger.warn(
        `getPersonalizedFeed: Found ${allPosts.length - nonBannedPosts.length} banned posts in query results`,
      );
    }

    // Rank all fetched posts once
    const rankedPosts = await this.rankPostsByRelevance(
      nonBannedPosts,
      currentUserId,
    );

    // Use actual ranked posts count as total (not the full database count)
    // because we only rank a fixed batch of posts
    const actualTotal = rankedPosts.length;

    // Paginate from ranked results
    const skip = (page - 1) * limit;
    const paginatedPosts = rankedPosts.slice(skip, skip + limit);

    const processedPosts = await this.processPostsWithReactions(
      paginatedPosts,
      currentUserId,
    );

    return {
      data: processedPosts,
      meta: this.buildPaginationMeta(page, limit, actualTotal),
    };
  }

  private async rankPostsByRelevance(
    posts: RawPost[],
    currentUserId: string,
    maxResults?: number,
  ): Promise<RawPost[]> {
    if (posts.length === 0) {
      return [];
    }

    // Get user profile with tag scores
    const userProfile = await this.userProfileRepository.repo.findOne({
      where: { accountId: currentUserId },
      select: ['accountId', 'tagScores'],
    });

    const userTagScores = userProfile?.tagScores || {};

    // Get follow status for all authors
    const authorIds = [...new Set(posts.map((post) => post.author_id))];
    const followMap = await this.getFollowStatusMap(authorIds, currentUserId);

    // Calculate relevance scores for all posts
    const postsWithScores = await Promise.all(
      posts.map(async (post) => {
        const isFollowing = followMap.get(post.author_id) || false;
        const score = await this.calculatePostRelevanceScore(
          post,
          userTagScores,
          isFollowing,
        );
        return { post, score };
      }),
    );

    // Sort by score (descending)
    postsWithScores.sort((a, b) => b.score - a.score);

    // Return all ranked posts or limit if specified
    const rankedPosts = postsWithScores.map((item) => item.post);
    return maxResults ? rankedPosts.slice(0, maxResults) : rankedPosts;
  }

  async getFollowingFeed(
    currentUserId: string,
    params: PaginationParams = {},
  ): Promise<PaginationResult<PostResponseDto>> {
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
      const selectFields = this.getPostSelectFields();
      const postsQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoin('accounts', 'account', 'account.id = post.author_id')
        .leftJoin('locations', 'location', 'location.id = post.location_id')
        .where('post.author_id IN (:...followedUserIds)', { followedUserIds })
        .andWhere('post.is_hidden = :isHidden', { isHidden: false })
        .andWhere(
          '(post.visibility = :public OR post.visibility = :followers OR post.visibility IS NULL)',
          { public: 'public', followers: 'followers' },
        );

      // Add all select fields
      selectFields.forEach((field) => {
        postsQuery.addSelect(field);
      });

      postsQuery.orderBy('post.created_at', 'DESC').offset(skip).limit(limit);

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

  async createPost(dto: CreatePostDto): Promise<PostResponseDto> {
    try {
      // Check if user has onboarded
      if (dto.authorId) {
        const account = await this.postRepository.repo.manager
          .getRepository(AccountEntity)
          .findOne({
            where: { id: dto.authorId },
            select: ['id', 'hasOnboarded'],
          });

        if (!account) {
          throw new NotFoundException('Account not found');
        }

        if (!account.hasOnboarded) {
          throw new ForbiddenException(
            'User must complete onboarding before creating posts',
          );
        }
      }

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
            author: { id: dto.authorId },
            isVerified,
            totalUpvotes: 0,
            totalDownvotes: 0,
            totalComments: 0,
          });
          const savedPost = await transactionalEntityManager.save(post);

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

      // Get the created post with all relations
      const selectFields = this.getPostSelectFields();
      const queryBuilder = this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoin('accounts', 'account', 'account.id = post.author_id')
        .leftJoin('locations', 'location', 'location.id = post.location_id')
        .where('post.post_id = :postId', { postId: result.postId });

      // Add all select fields
      selectFields.forEach((field) => {
        queryBuilder.addSelect(field);
      });

      const createdPost = await queryBuilder.getRawOne();

      if (!createdPost) {
        throw new NotFoundException('Post not found after creation');
      }

      return this.mapRawPostToDto(createdPost, null, false);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async updatePost(
    postId: string,
    dto: UpdatePostDto,
    userId: string,
  ): Promise<PostResponseDto> {
    try {
      // Find the post
      const post = await this.postRepository.repo.findOne({
        where: { postId },
        relations: ['author'],
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      // Check authorization - only author can edit
      if (!post.author || post.author.id !== userId) {
        throw new ForbiddenException('You are not allowed to edit this post');
      }

      // Validate post type if provided
      const postType = dto.type || post.type;
      if (dto.type === PostType.BLOG && !dto.visibility && !post.visibility) {
        throw new BadRequestException('Visibility is required for blog posts');
      }

      if (postType === PostType.REVIEW) {
        const locationId =
          dto.locationId !== undefined ? dto.locationId : post.locationId;
        const eventId = dto.eventId !== undefined ? dto.eventId : post.eventId;
        if (!locationId && !eventId) {
          throw new BadRequestException(
            'Review posts must have either locationId or eventId',
          );
        }
      }

      // Track if rating changed for analytics update
      const oldRating = post.rating;
      const oldLocationId = post.locationId;
      const oldEventId = post.eventId;
      const ratingChanged =
        dto.rating !== undefined && dto.rating !== oldRating;
      const locationChanged =
        dto.locationId !== undefined && dto.locationId !== oldLocationId;
      const eventChanged =
        dto.eventId !== undefined && dto.eventId !== oldEventId;

      // Check if user has checked in at location (for review posts)
      let isVerified = post.isVerified;
      if (postType === PostType.REVIEW && dto.locationId && userId) {
        const checkIn = await this.checkInRepository.repo.findOne({
          where: {
            userProfileId: userId,
            locationId: dto.locationId,
          },
        });
        isVerified = !!checkIn;
      }

      const result = await this.postRepository.repo.manager.transaction(
        async (transactionalEntityManager) => {
          // Confirm upload for new images if provided
          if (dto.imageUrls && dto.imageUrls.length > 0) {
            await this.fileStorageService.confirmUpload(
              dto.imageUrls,
              transactionalEntityManager,
            );
          }

          // Confirm upload for new videos if provided
          if (dto.videoIds && dto.videoIds.length > 0) {
            await this.fileStorageService.confirmUpload(
              dto.videoIds,
              transactionalEntityManager,
            );
          }

          // Build update object with only provided fields
          const updateData: Partial<PostEntity> = {};
          if (dto.content !== undefined) updateData.content = dto.content;
          if (dto.imageUrls !== undefined) updateData.imageUrls = dto.imageUrls;
          if (dto.type !== undefined) updateData.type = dto.type;
          if (dto.visibility !== undefined)
            updateData.visibility = dto.visibility;
          if (dto.rating !== undefined) updateData.rating = dto.rating;
          if (dto.locationId !== undefined)
            updateData.locationId = dto.locationId;
          if (dto.eventId !== undefined) updateData.eventId = dto.eventId;
          if (isVerified !== post.isVerified)
            updateData.isVerified = isVerified;

          // Clear rating for blog posts
          if (dto.type === PostType.BLOG) {
            updateData.rating = undefined;
          }

          // Update the post
          await transactionalEntityManager.update(
            PostEntity,
            { postId },
            updateData,
          );

          // If rating changed or location/event changed, update analytics
          if (
            postType === PostType.REVIEW &&
            (ratingChanged || locationChanged || eventChanged)
          ) {
            // Update old location/event analytics if changed
            if (locationChanged && oldLocationId) {
              await this.updateEntityRating(
                oldLocationId,
                AnalyticEntityType.LOCATION,
                transactionalEntityManager,
              );
            }
            if (eventChanged && oldEventId) {
              await this.updateEntityRating(
                oldEventId,
                AnalyticEntityType.EVENT,
                transactionalEntityManager,
              );
            }

            // Update new location/event analytics
            const newLocationId =
              dto.locationId !== undefined ? dto.locationId : post.locationId;
            const newEventId =
              dto.eventId !== undefined ? dto.eventId : post.eventId;
            if (newLocationId) {
              await this.updateEntityRating(
                newLocationId,
                AnalyticEntityType.LOCATION,
                transactionalEntityManager,
              );
            }
            if (newEventId) {
              await this.updateEntityRating(
                newEventId,
                AnalyticEntityType.EVENT,
                transactionalEntityManager,
              );
            }
          }

          // Get updated post
          const postRepo = transactionalEntityManager.getRepository(PostEntity);
          const updatedPost = await postRepo.findOne({
            where: { postId },
          });
          return updatedPost;
        },
      );

      if (!result) {
        throw new NotFoundException('Post not found after update');
      }

      // Get the updated post with all relations
      const selectFields = this.getPostSelectFields();
      const queryBuilder = this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoin('accounts', 'account', 'account.id = post.author_id')
        .leftJoin('locations', 'location', 'location.id = post.location_id')
        .where('post.post_id = :postId', { postId });

      // Add all select fields
      selectFields.forEach((field) => {
        queryBuilder.addSelect(field);
      });

      const updatedPostRaw = await queryBuilder.getRawOne();

      if (!updatedPostRaw) {
        throw new NotFoundException('Post not found after update');
      }

      // Get user reaction and follow status if userId is provided
      let currentUserReaction: ReactType | null = null;
      let isFollowing = false;

      if (userId) {
        const [reaction, follow] = await Promise.all([
          this.reactRepository.repo.findOne({
            where: {
              entityId: postId,
              entityType: ReactEntityType.POST,
              authorId: userId,
            },
          }),
          this.followRepository.repo.findOne({
            where: {
              followerId: userId,
              entityId: updatedPostRaw.author_id,
              entityType: FollowEntityType.USER,
            },
          }),
        ]);

        currentUserReaction = reaction?.type || null;
        isFollowing = !!follow;
      }

      return this.mapRawPostToDto(
        updatedPostRaw,
        currentUserReaction,
        isFollowing,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async updateEntityRating(
    entityId: string,
    entityType: AnalyticEntityType,
    transactionalEntityManager: EntityManager,
  ): Promise<void> {
    const postRepo = transactionalEntityManager.getRepository(PostEntity);

    // For LOCATION, update location table directly
    if (entityType === AnalyticEntityType.LOCATION) {
      const locationRepo =
        transactionalEntityManager.getRepository(LocationEntity);

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

      // Update location directly
      await locationRepo.update(
        { id: entityId },
        {
          totalReviews,
          averageRating,
        },
      );
    }
    // For EVENT, update event table directly
    else if (entityType === AnalyticEntityType.EVENT) {
      const eventRepo = transactionalEntityManager.getRepository(EventEntity);

      const reviews = await postRepo.find({
        where: {
          eventId: entityId,
          type: PostType.REVIEW,
        },
      });

      const totalReviews = reviews.length;
      let avgRating = 0;

      if (reviews.length > 0) {
        const totalRating = reviews.reduce(
          (sum, review) => sum + (review.rating || 0),
          0,
        );
        avgRating = parseFloat((totalRating / reviews.length).toFixed(2));
      }

      await eventRepo.update(
        { id: entityId },
        {
          totalReviews,
          avgRating,
        },
      );
    }
  }

  async getPostById(postId: string, userId?: string): Promise<PostResponseDto> {
    try {
      const selectFields = this.getPostSelectFields();
      const queryBuilder = this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoin('accounts', 'account', 'account.id = post.author_id')
        .leftJoin('locations', 'location', 'location.id = post.location_id')
        .where('post.post_id = :postId', { postId });

      // Add all select fields
      selectFields.forEach((field) => {
        queryBuilder.addSelect(field);
      });

      const post = await queryBuilder.getRawOne();

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

  async reactPost(dto: ReactPostDto): Promise<ReactPostResponseDto> {
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
      let shouldEmitEvent = false;
      let finalReactType: ReactType | null = null;

      if (react && react.type === dto.type) {
        // User is removing their reaction
        await this.reactRepository.repo.delete(react.id);
        if (dto.type === ReactType.UPVOTE) upvotesDelta = -1;
        if (dto.type === ReactType.DOWNVOTE) downvotesDelta = -1;
        finalReactType = null; // reaction removed
      } else if (react && react.type !== dto.type) {
        // User is changing their reaction
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
        shouldEmitEvent = true;
        finalReactType = dto.type;
      } else {
        // User is adding a new reaction
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
        shouldEmitEvent = true;
        finalReactType = dto.type;
      }

      await this.postRepository.repo.increment(
        { postId: post.postId },
        'totalUpvotes',
        upvotesDelta,
      );
      await this.postRepository.repo.increment(
        { postId: post.postId },
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

      return {
        postId: dto.postId,
        reactionType: finalReactType || dto.type,
        message: 'React post successfully',
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  async deletePost(dto: DeletePostDto): Promise<DeletePostResponseDto> {
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

      return {
        postId: dto.postId,
        message: 'Post deleted successfully',
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async getReactionsOfPost(
    postId: string,
    reactType: ReactType,
    params: PaginationParams = {},
  ): Promise<PaginationResult<PostAuthorResponseDto>> {
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

      return {
        data: reactions.map((reaction) => ({
          id: reaction.author.id,
          firstName: reaction.author.firstName,
          lastName: reaction.author.lastName,
          avatarUrl: reaction.author.avatarUrl,
          isFollow: false, // This would need to be checked separately if needed
        })),
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
  ): Promise<PaginationResult<PostAuthorResponseDto>> {
    return this.getReactionsOfPost(postId, ReactType.UPVOTE, params);
  }

  async getDownvotesOfPost(
    postId: string,
    params: PaginationParams = {},
  ): Promise<PaginationResult<PostAuthorResponseDto>> {
    return this.getReactionsOfPost(postId, ReactType.DOWNVOTE, params);
  }

  async getAllReactionsOfPost(postId: string): Promise<{
    upvotes: PostAuthorResponseDto[];
    downvotes: PostAuthorResponseDto[];
  }> {
    try {
      const [upvotes, downvotes] = await Promise.all([
        this.getUpvotesOfPost(postId),
        this.getDownvotesOfPost(postId),
      ]);

      return {
        upvotes: upvotes.data,
        downvotes: downvotes.data,
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
  ): Promise<PaginationResult<PostResponseDto>> {
    try {
      const { page, limit, skip } = this.normalizePaginationParams(params);

      const selectFields = this.getPostSelectFields();
      const postsQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoin('accounts', 'account', 'account.id = post.author_id')
        .leftJoin('locations', 'location', 'location.id = post.location_id')
        .where('post.author_id = :authorId', { authorId })
        .andWhere('post.is_hidden = :isHidden', { isHidden: false });

      // Add type filter if specified
      if (postType) {
        postsQuery.andWhere('post.type = :postType', { postType });
      }

      // Add all select fields
      selectFields.forEach((field) => {
        postsQuery.addSelect(field);
      });

      postsQuery.orderBy('post.createdAt', 'DESC').offset(skip).limit(limit);

      const countQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .where('post.author_id = :authorId', { authorId })
        .andWhere('post.is_hidden = :isHidden', { isHidden: false });

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
  ): Promise<PaginationResult<PostResponseDto>> {
    try {
      const { page, limit, skip } = this.normalizePaginationParams(params);

      const selectFields = this.getPostSelectFields();
      const postsQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoin('accounts', 'account', 'account.id = post.author_id')
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

      // Add all select fields
      selectFields.forEach((field) => {
        postsQuery.addSelect(field);
      });

      postsQuery.orderBy('post.created_at', 'DESC').offset(skip).limit(limit);

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
  ): Promise<PaginationResult<PostResponseDto>> {
    return this.getPostsByAuthorIdAndType(authorId, params, currentUserId);
  }

  async getReviewsByAuthorId(
    authorId: string,
    params: PaginationParams = {},
    currentUserId?: string,
  ): Promise<PaginationResult<PostResponseDto>> {
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
  ): Promise<PaginationResult<PostResponseDto>> {
    return this.getPostsByAuthorIdAndType(
      authorId,
      params,
      currentUserId,
      PostType.BLOG,
    );
  }

  async getAllPosts(
    params: PaginationParams = {},
  ): Promise<PaginationResult<PostResponseDto>> {
    const { page, limit, skip } = this.normalizePaginationParams(params);

    const [posts, total] = await this.postRepository.repo.findAndCount({
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
        totalUpvotes: true,
        totalDownvotes: true,
        totalComments: true,
        author: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          email: true,
        },
      },
    });

    // Map PostEntity to PostResponseDto
    const data: PostResponseDto[] = posts.map((post) => ({
      postId: post.postId,
      content: post.content,
      imageUrls: post.imageUrls,
      type: post.type,
      isVerified: post.isVerified,
      visibility: post.visibility,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.author.id,
        firstName: post.author.firstName,
        lastName: post.author.lastName,
        avatarUrl: post.author.avatarUrl,
        isFollow: false, // This would need to be checked separately if needed
      },
      analytics: {
        totalUpvotes: post.totalUpvotes || 0,
        totalDownvotes: post.totalDownvotes || 0,
        totalComments: post.totalComments || 0,
      },
      currentUserReaction: null,
      ...(post.rating && { rating: post.rating }),
    }));

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
  ): Promise<PaginationResult<PostResponseDto>> {
    try {
      if (!locationId && !eventId) {
        throw new BadRequestException(
          'Either locationId or eventId is required',
        );
      }

      const { page, limit, skip } = this.normalizePaginationParams(params);

      // Build posts query
      const selectFields = this.getPostSelectFields();
      const postsQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoin('accounts', 'account', 'account.id = post.author_id')
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

      // Add all select fields
      selectFields.forEach((field) => {
        postsQuery.addSelect(field);
      });

      postsQuery.orderBy('post.created_at', 'DESC').offset(skip).limit(limit);

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
  ): Promise<PaginationResult<PostResponseDto>> {
    try {
      const { page, limit, skip } = this.normalizePaginationParams(params);

      // Build posts query
      const selectFields = this.getPostSelectFields();
      const postsQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoin('accounts', 'account', 'account.id = post.author_id')
        .leftJoin('locations', 'location', 'location.id = post.location_id')
        .where('post.location_id = :locationId', { locationId })
        .andWhere('post.is_hidden = :isHidden', { isHidden: false });

      // Add all select fields
      selectFields.forEach((field) => {
        postsQuery.addSelect(field);
      });

      postsQuery.orderBy('post.created_at', 'DESC').offset(skip).limit(limit);

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

  async updatePostVisibility(
    postId: string,
    isHidden: boolean,
  ): Promise<UpdatePostVisibilityResponseDto> {
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

  async banPost(postId: string, reason?: string): Promise<BanPostResponseDto> {
    try {
      this.logger.debug(
        `Banning post ${postId}${reason ? ` with reason: ${reason}` : ''}`,
      );

      const post = await this.postRepository.repo.findOne({
        where: { postId },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      if (post.isHidden) {
        throw new BadRequestException('Post is already banned');
      }

      // Use save() instead of update() to ensure entity is properly persisted
      post.isHidden = true;
      await this.postRepository.repo.save(post);

      this.logger.debug(`Post ${postId} saved with isHidden = true`);

      // Verify the update was successful by querying directly from database
      const updatedPost = await this.postRepository.repo.findOne({
        where: { postId },
        select: ['postId', 'isHidden'],
      });

      if (!updatedPost || !updatedPost.isHidden) {
        this.logger.error(
          `Failed to verify ban for post ${postId}. Updated post: ${JSON.stringify(updatedPost)}`,
        );
        throw new InternalServerErrorException(
          'Failed to ban post: update verification failed',
        );
      }

      this.logger.log(`Post ${postId} banned successfully`);

      return {
        message: 'Post banned successfully',
        postId,
        isBanned: true,
        reason,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Error banning post ${postId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(error.message);
    }
  }
}
