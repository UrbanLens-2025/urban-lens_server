import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IPostQueryService } from '@/modules/post/app/IPostQuery.service';
import { PostRepositoryProvider } from '@/modules/post/infra/repository/Post.repository';
import { CommentRepositoryProvider } from '@/modules/post/infra/repository/Comment.repository';
import { PostEntity, PostType } from '@/modules/post/domain/Post.entity';
import { CommentEntity } from '@/modules/post/domain/Comment.entity';
import { ReactEntity, ReactEntityType, ReactType } from '@/modules/post/domain/React.entity';
import {
  AnalyticEntity,
  AnalyticEntityType,
} from '@/modules/analytic/domain/Analytic.entity';
import { FollowEntity, FollowEntityType } from '@/modules/account/domain/Follow.entity';
import { PostResponseDto } from '@/common/dto/post/res/PostResponse.dto';
import { PostAuthorResponseDto } from '@/common/dto/post/res/PostAuthorResponse.dto';
import { PostAnalyticsResponseDto } from '@/common/dto/post/res/PostAnalyticsResponse.dto';
import { CommentResponseDto } from '@/common/dto/post/res/CommentResponse.dto';
import { PostReactionsResponseDto } from '@/common/dto/post/res/PostReactionsResponse.dto';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { GetPostByIdDto } from '@/common/dto/post/GetPostById.dto';
import { GetMyPostsDto } from '@/common/dto/post/GetMyPosts.dto';
import { GetPostByAuthorIdDto } from '@/common/dto/post/GetPostByAuthorId.dto';
import { GetReviewsDto } from '@/common/dto/post/GetReviews.dto';
import { GetPostsByLocationDto } from '@/common/dto/post/GetPostsByLocation.dto';
import { GetReactionsDto } from '@/common/dto/post/GetReactions.dto';
import { GetCommentsByPostIdDto } from '@/common/dto/post/GetCommentsByPostId.dto';
import { GetCommentReactionsDto } from '@/common/dto/post/GetCommentReactions.dto';
import { GetBasicFeedDto } from '@/common/dto/post/GetBasicFeed.dto';
import { GetFollowingFeedDto } from '@/common/dto/post/GetFollowingFeed.dto';
import { Paginated, PaginateQuery } from 'nestjs-paginate';

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
export class PostQueryService
  extends CoreService
  implements IPostQueryService
{
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
  ): PostResponseDto {
    const author: PostAuthorResponseDto = {
      id: rawPost.author_id,
      firstName: rawPost.author_firstname,
      lastName: rawPost.author_lastname,
      avatarUrl: rawPost.author_avatarurl,
      isFollow: isFollowing,
    };

    const analytics: PostAnalyticsResponseDto = {
      totalUpvotes: rawPost.analytic_total_upvotes || 0,
      totalDownvotes: rawPost.analytic_total_downvotes || 0,
      totalComments: rawPost.analytic_total_comments || 0,
    };

    const result: any = {
      postId: rawPost.post_postid,
      content: rawPost.post_content,
      imageUrls: rawPost.post_imageurls,
      type: rawPost.post_type,
      isVerified: rawPost.post_isverified,
      visibility: rawPost.post_visibility || null,
      createdAt: rawPost.post_createdat,
      updatedAt: rawPost.post_updatedat,
      author,
      analytics,
      currentUserReaction: currentUserReaction || null,
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
      result.locationId = rawPost.location_id;
    }

    // Add eventId if exists
    if (rawPost.post_eventid) {
      result.eventId = rawPost.post_eventid;
    }

    return this.mapTo(PostResponseDto, result);
  }

  private async getUserReactionsMap(
    postIds: string[],
    userId: string,
  ): Promise<Map<string, ReactType>> {
    if (postIds.length === 0) {
      return new Map();
    }

    const reactRepository = this.dataSource.getRepository(ReactEntity);
    const userReactions = await reactRepository
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

    const followRepository = this.dataSource.getRepository(FollowEntity);
    const follows = await followRepository
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

  private buildPaginatedResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): Paginated<T> {
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      meta: {
        itemsPerPage: limit,
        totalItems: total,
        currentPage: page,
        totalPages,
        sortBy: [],
        searchBy: [],
        search: '',
        select: [],
        filter: {},
      },
      links: {
        first: '',
        previous: '',
        current: '',
        next: '',
        last: '',
      },
    };
  }

  async getBasicFeed(dto: GetBasicFeedDto): Promise<Paginated<PostResponseDto>> {
    try {
      const page = dto.query?.page || 1;
      const limit = dto.query?.limit || 10;
      const skip = (page - 1) * limit;

      const postRepository = PostRepositoryProvider(this.dataSource);
      const postsQuery = postRepository
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

      const countQuery = postRepository
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
        dto.currentUserId,
      );

      return this.buildPaginatedResult(processedPosts, total, page, limit);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getFollowingFeed(dto: GetFollowingFeedDto): Promise<Paginated<PostResponseDto>> {
    try {
      const page = dto.query?.page || 1;
      const limit = dto.query?.limit || 10;
      const skip = (page - 1) * limit;

      // Get list of users that current user is following
      const followRepository = this.dataSource.getRepository(FollowEntity);
      const followedUsers = await followRepository.find({
        where: {
          followerId: dto.currentUserId,
          entityType: FollowEntityType.USER,
        },
        select: ['entityId'],
      });

      const followedUserIds = followedUsers.map((f) => f.entityId);

      // If not following anyone, return empty result
      if (followedUserIds.length === 0) {
        return this.buildPaginatedResult([], 0, page, limit);
      }

      const postRepository = PostRepositoryProvider(this.dataSource);
      const postsQuery = postRepository
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

      const countQuery = postRepository
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
        dto.currentUserId,
      );

      return this.buildPaginatedResult(processedPosts, total, page, limit);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPostById(dto: GetPostByIdDto): Promise<PostResponseDto> {
    try {
      const postRepository = PostRepositoryProvider(this.dataSource);
      const post = await postRepository
        .createQueryBuilder('post')
        .leftJoin('post.author', 'author')
        .leftJoin(
          'analytic',
          'analytic',
          'analytic.entity_id::uuid = post.post_id AND analytic.entity_type = :type',
          { type: AnalyticEntityType.POST },
        )
        .leftJoin('locations', 'location', 'location.id = post.location_id')
        .where('post.post_id = :postId', { postId: dto.postId })
        .select(this.getPostSelectFields())
        .getRawOne();

      if (!post) {
        throw new NotFoundException('Post not found');
      }

      let currentUserReaction: ReactType | null = null;
      let isFollowing = false;

      // Get user reaction and follow status if userId is provided
      if (dto.userId) {
        const reactRepository = this.dataSource.getRepository(ReactEntity);
        const followRepository = this.dataSource.getRepository(FollowEntity);
        const [userReaction, followStatus] = await Promise.all([
          reactRepository.findOne({
            where: {
              entityId: dto.postId,
              entityType: ReactEntityType.POST,
              authorId: dto.userId,
            },
            select: ['type'],
          }),
          followRepository.findOne({
            where: {
              followerId: dto.userId,
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
      throw new InternalServerErrorException(error.message);
    }
  }

  async getMyPosts(dto: GetMyPostsDto): Promise<Paginated<PostResponseDto>> {
    try {
      const page = dto.query?.page || 1;
      const limit = dto.query?.limit || 10;
      const skip = (page - 1) * limit;

      const postRepository = PostRepositoryProvider(this.dataSource);
      const postsQuery = postRepository
        .createQueryBuilder('post')
        .leftJoin('post.author', 'author')
        .leftJoin(
          'analytic',
          'analytic',
          'analytic.entity_id::uuid = post.post_id AND analytic.entity_type = :analyticType',
          { analyticType: AnalyticEntityType.POST },
        )
        .leftJoin('locations', 'location', 'location.id = post.location_id')
        .where('post.author_id = :authorId', { authorId: dto.authorId });

      // Apply filters
      if (dto.type) {
        postsQuery.andWhere('post.type = :postType', {
          postType: dto.type,
        });
      }

      if (dto.visibility) {
        postsQuery.andWhere('post.visibility = :visibility', {
          visibility: dto.visibility,
        });
      }

      if (dto.isVerified !== undefined) {
        postsQuery.andWhere('post.is_verified = :isVerified', {
          isVerified: dto.isVerified,
        });
      }

      postsQuery
        .select(this.getPostSelectFields())
        .orderBy('post.created_at', 'DESC')
        .offset(skip)
        .limit(limit);

      const countQuery = postRepository
        .createQueryBuilder('post')
        .where('post.author_id = :authorId', { authorId: dto.authorId });

      // Apply same filters to count query
      if (dto.type) {
        countQuery.andWhere('post.type = :postType', {
          postType: dto.type,
        });
      }

      if (dto.visibility) {
        countQuery.andWhere('post.visibility = :visibility', {
          visibility: dto.visibility,
        });
      }

      if (dto.isVerified !== undefined) {
        countQuery.andWhere('post.is_verified = :isVerified', {
          isVerified: dto.isVerified,
        });
      }

      const [posts, total] = await Promise.all([
        postsQuery.getRawMany(),
        countQuery.getCount(),
      ]);

      const processedPosts = await this.processPostsWithReactions(
        posts,
        dto.currentUserId,
      );

      return this.buildPaginatedResult(processedPosts, total, page, limit);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPostByAuthorId(dto: GetPostByAuthorIdDto): Promise<Paginated<PostResponseDto>> {
    return this.getPostsByAuthorIdAndType(dto, undefined);
  }

  async getReviewsByAuthorId(dto: GetPostByAuthorIdDto): Promise<Paginated<PostResponseDto>> {
    return this.getPostsByAuthorIdAndType(dto, PostType.REVIEW);
  }

  async getBlogsByAuthorId(dto: GetPostByAuthorIdDto): Promise<Paginated<PostResponseDto>> {
    return this.getPostsByAuthorIdAndType(dto, PostType.BLOG);
  }

  private async getPostsByAuthorIdAndType(
    dto: GetPostByAuthorIdDto,
    postType?: PostType,
  ): Promise<Paginated<PostResponseDto>> {
    try {
      const page = dto.query?.page || 1;
      const limit = dto.query?.limit || 10;
      const skip = (page - 1) * limit;

      const postRepository = PostRepositoryProvider(this.dataSource);
      const postsQuery = postRepository
        .createQueryBuilder('post')
        .leftJoin('post.author', 'author')
        .leftJoin(
          'analytic',
          'analytic',
          'analytic.entity_id::uuid = post.post_id AND analytic.entity_type = :analyticType',
          { analyticType: AnalyticEntityType.POST },
        )
        .leftJoin('locations', 'location', 'location.id = post.location_id')
        .where('post.author_id = :authorId', { authorId: dto.authorId });

      // Add type filter if specified
      if (postType) {
        postsQuery.andWhere('post.type = :postType', { postType });
      }

      postsQuery
        .select(this.getPostSelectFields())
        .orderBy('post.created_at', 'DESC')
        .offset(skip)
        .limit(limit);

      const countQuery = postRepository
        .createQueryBuilder('post')
        .where('post.author_id = :authorId', { authorId: dto.authorId });

      if (postType) {
        countQuery.andWhere('post.type = :postType', { postType });
      }

      const [posts, total] = await Promise.all([
        postsQuery.getRawMany(),
        countQuery.getCount(),
      ]);

      const processedPosts = await this.processPostsWithReactions(
        posts,
        dto.currentUserId,
      );

      return this.buildPaginatedResult(processedPosts, total, page, limit);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllPosts(query: PaginateQuery): Promise<Paginated<PostResponseDto>> {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    const postRepository = PostRepositoryProvider(this.dataSource);
    const [data, total] = await postRepository.findAndCount({
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

    return this.mapToPaginated(PostResponseDto, this.buildPaginatedResult(data, total, page, limit));
  }

  async getReviews(dto: GetReviewsDto): Promise<Paginated<PostResponseDto>> {
    try {
      if (!dto.locationId && !dto.eventId) {
        throw new BadRequestException(
          'Either locationId or eventId is required',
        );
      }

      const page = dto.query?.page || 1;
      const limit = dto.query?.limit || 10;
      const skip = (page - 1) * limit;

      const postRepository = PostRepositoryProvider(this.dataSource);
      const postsQuery = postRepository
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
      if (dto.locationId && dto.eventId) {
        postsQuery.andWhere(
          '(post.location_id = :locationId OR post.event_id = :eventId)',
          { locationId: dto.locationId, eventId: dto.eventId },
        );
      } else if (dto.locationId) {
        postsQuery.andWhere('post.location_id = :locationId', {
          locationId: dto.locationId,
        });
      } else if (dto.eventId) {
        postsQuery.andWhere('post.event_id = :eventId', { eventId: dto.eventId });
      }

      postsQuery
        .select(this.getPostSelectFields())
        .orderBy('post.created_at', 'DESC')
        .offset(skip)
        .limit(limit);

      const countQuery = postRepository
        .createQueryBuilder('post')
        .where('post.type = :type', { type: PostType.REVIEW })
        .andWhere('post.is_hidden = :isHidden', { isHidden: false });

      if (dto.locationId && dto.eventId) {
        countQuery.andWhere(
          '(post.location_id = :locationId OR post.event_id = :eventId)',
          { locationId: dto.locationId, eventId: dto.eventId },
        );
      } else if (dto.locationId) {
        countQuery.andWhere('post.location_id = :locationId', {
          locationId: dto.locationId,
        });
      } else if (dto.eventId) {
        countQuery.andWhere('post.event_id = :eventId', { eventId: dto.eventId });
      }

      const [posts, total] = await Promise.all([
        postsQuery.getRawMany(),
        countQuery.getCount(),
      ]);

      const processedPosts = await this.processPostsWithReactions(
        posts,
        dto.currentUserId,
      );

      return this.buildPaginatedResult(processedPosts, total, page, limit);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getPostsByLocation(dto: GetPostsByLocationDto): Promise<Paginated<PostResponseDto>> {
    try {
      const page = dto.query?.page || 1;
      const limit = dto.query?.limit || 10;
      const skip = (page - 1) * limit;

      const postRepository = PostRepositoryProvider(this.dataSource);
      const postsQuery = postRepository
        .createQueryBuilder('post')
        .leftJoin('post.author', 'author')
        .leftJoin(
          'analytic',
          'analytic',
          'analytic.entity_id::uuid = post.post_id AND analytic.entity_type = :analyticType',
          { analyticType: AnalyticEntityType.POST },
        )
        .leftJoin('locations', 'location', 'location.id = post.location_id')
        .where('post.location_id = :locationId', { locationId: dto.locationId })
        .andWhere('post.is_hidden = :isHidden', { isHidden: false })
        .select(this.getPostSelectFields())
        .orderBy('post.created_at', 'DESC')
        .offset(skip)
        .limit(limit);

      const countQuery = postRepository
        .createQueryBuilder('post')
        .where('post.location_id = :locationId', { locationId: dto.locationId })
        .andWhere('post.is_hidden = :isHidden', { isHidden: false });

      const [posts, total] = await Promise.all([
        postsQuery.getRawMany(),
        countQuery.getCount(),
      ]);

      const processedPosts = await this.processPostsWithReactions(
        posts,
        dto.currentUserId,
      );

      return this.buildPaginatedResult(processedPosts, total, page, limit);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getUpvotesOfPost(dto: GetReactionsDto): Promise<Paginated<AccountResponseDto>> {
    return this.getReactionsOfPost(dto, ReactType.UPVOTE);
  }

  async getDownvotesOfPost(dto: GetReactionsDto): Promise<Paginated<AccountResponseDto>> {
    return this.getReactionsOfPost(dto, ReactType.DOWNVOTE);
  }

  private async getReactionsOfPost(
    dto: GetReactionsDto,
    reactType: ReactType,
  ): Promise<Paginated<AccountResponseDto>> {
    try {
      const page = dto.query?.page || 1;
      const limit = dto.query?.limit || 10;
      const skip = (page - 1) * limit;

      const reactRepository = this.dataSource.getRepository(ReactEntity);
      const queryBuilder = reactRepository
        .createQueryBuilder('react')
        .leftJoin('react.author', 'author')
        .where('react.entityId = :postId', { postId: dto.postId })
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
      const users = reactions.map((reaction) => reaction.author);

      return this.mapToPaginated(
        AccountResponseDto,
        this.buildPaginatedResult(users, total, page, limit),
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getAllReactionsOfPost(dto: GetPostByIdDto): Promise<PostReactionsResponseDto> {
    try {
      const [upvotes, downvotes] = await Promise.all([
        this.getUpvotesOfPost({ ...dto, query: { page: 1, limit: 1000, path: '' } as PaginateQuery }),
        this.getDownvotesOfPost({ ...dto, query: { page: 1, limit: 1000, path: '' } as PaginateQuery }),
      ]);

      return {
        upvotes: upvotes.data,
        totalUpvotes: upvotes.meta.totalItems,
        downvotes: downvotes.data,
        totalDownvotes: downvotes.meta.totalItems,
        totalReactions: upvotes.meta.totalItems + downvotes.meta.totalItems,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCommentsByPostId(dto: GetCommentsByPostIdDto): Promise<Paginated<CommentResponseDto>> {
    try {
      const page = dto.query?.page || 1;
      const limit = dto.query?.limit || 10;
      const skip = (page - 1) * limit;

      const commentRepository = CommentRepositoryProvider(this.dataSource);
      const queryBuilder = commentRepository
        .createQueryBuilder('comment')
        .leftJoin('comment.author', 'author')
        .leftJoin(
          'analytic',
          'analytic',
          `analytic.entity_id::uuid = comment.comment_id AND analytic.entity_type = :type`,
          { type: AnalyticEntityType.COMMENT },
        )
        .where('comment.post_id = :postId', { postId: dto.postId })
        .select([
          'comment.commentId',
          'comment.content',
          'comment.createdAt',
          'comment.updatedAt',
          'author.id',
          'author.firstName',
          'author.lastName',
          'author.avatarUrl',
          'analytic.total_upvotes',
          'analytic.total_downvotes',
        ]);

      const total = await queryBuilder.getCount();
      const { raw, entities } = await queryBuilder
        .offset(skip)
        .limit(limit)
        .getRawAndEntities();

      const data = entities.map((entity, index) => {
        const row = raw[index];
        return {
          ...entity,
          totalUpvotes: Number(row.analytic_total_upvotes) || 0,
          totalDownvotes: Number(row.analytic_total_downvotes) || 0,
        };
      });

      return this.mapToPaginated(
        CommentResponseDto,
        this.buildPaginatedResult(data, total, page, limit),
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getUpvotesOfComment(dto: GetCommentReactionsDto): Promise<Paginated<AccountResponseDto>> {
    return this.getReactionsOfComment(dto, ReactType.UPVOTE);
  }

  async getDownvotesOfComment(dto: GetCommentReactionsDto): Promise<Paginated<AccountResponseDto>> {
    return this.getReactionsOfComment(dto, ReactType.DOWNVOTE);
  }

  private async getReactionsOfComment(
    dto: GetCommentReactionsDto,
    reactType: ReactType,
  ): Promise<Paginated<AccountResponseDto>> {
    try {
      const page = dto.query?.page || 1;
      const limit = dto.query?.limit || 10;
      const skip = (page - 1) * limit;

      const reactRepository = this.dataSource.getRepository(ReactEntity);
      const queryBuilder = reactRepository
        .createQueryBuilder('react')
        .leftJoin('react.author', 'author')
        .where('react.entityId = :commentId', { commentId: dto.commentId })
        .andWhere('react.entityType = :entityType', {
          entityType: ReactEntityType.COMMENT,
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
      const users = reactions.map((reaction) => reaction.author);

      return this.mapToPaginated(
        AccountResponseDto,
        this.buildPaginatedResult(users, total, page, limit),
      );
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}

