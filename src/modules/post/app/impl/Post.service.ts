/* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-return */
// noinspection ExceptionCaughtLocallyJS

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
import { PaginateQuery, Paginated, paginate } from 'nestjs-paginate';
import { CheckInRepository } from '@/modules/business/infra/repository/CheckIn.repository';
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
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {
    super(postRepository.repo);
  }

  async getBasicFeed(
    params: PaginationParams = {},
    currentUserId?: string,
  ): Promise<PaginationResult<any>> {
    try {
      const page = Math.max(params.page ?? 1, 1);
      const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
      const skip = (page - 1) * limit;

      // Build query to get public posts
      const postsQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoin(
          'analytic',
          'analytic',
          'analytic.entity_id::uuid = post.post_id AND analytic.entity_type = :analyticType',
          { analyticType: AnalyticEntityType.POST },
        )
        .where('post.visibility = :visibility OR post.visibility IS NULL', {
          visibility: 'public',
        })
        .select([
          'post.post_id as post_postid',
          'post.content as post_content',
          'post.image_urls as post_imageurls',
          'post.type as post_type',
          'post.rating as post_rating',
          'post.location_id as post_locationid',
          'post.event_id as post_eventid',
          'post.is_verified as post_isverified',
          'post.created_at as post_createdat',
          'post.updated_at as post_updatedat',
          'author.id as author_id',
          'author.first_name as author_firstname',
          'author.last_name as author_lastname',
          'author.avatar_url as author_avatarurl',
          'analytic.total_upvotes as analytic_total_upvotes',
          'analytic.total_downvotes as analytic_total_downvotes',
          'analytic.total_comments as analytic_total_comments',
        ])
        .orderBy('post.created_at', 'DESC')
        .offset(skip)
        .limit(limit);

      // Count total posts
      const countQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .where('post.visibility = :visibility OR post.visibility IS NULL', {
          visibility: 'public',
        });

      const [posts, total] = await Promise.all([
        postsQuery.getRawMany(),
        countQuery.getCount(),
      ]);

      if (!posts.length) {
        return {
          data: [],
          meta: {
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        };
      }

      let processedPosts: any[];

      // If user is logged in, get their reactions
      if (currentUserId) {
        const postIds = posts.map((post) => post.post_postid);

        const userReactions = await this.reactRepository.repo
          .createQueryBuilder('react')
          .where('react.entityId IN (:...postIds)', { postIds })
          .andWhere('react.entityType = :entityType', {
            entityType: ReactEntityType.POST,
          })
          .andWhere('react.authorId = :currentUserId', { currentUserId })
          .select(['react.entityId', 'react.type'])
          .getMany();

        const reactionMap = new Map();
        userReactions.forEach((reaction) => {
          reactionMap.set(reaction.entityId, reaction.type);
        });

        processedPosts = posts.map((post) => {
          const result: any = {
            postId: post.post_postid,
            content: post.post_content,
            imageUrls: post.post_imageurls,
            type: post.post_type,
            isVerified: post.post_isverified,
            createdAt: post.post_createdat,
            updatedAt: post.post_updatedat,
            author: {
              id: post.author_id,
              firstName: post.author_firstname,
              lastName: post.author_lastname,
              avatarUrl: post.author_avatarurl,
            },
            analytics: {
              totalUpvotes: post.analytic_total_upvotes || 0,
              totalDownvotes: post.analytic_total_downvotes || 0,
              totalComments: post.analytic_total_comments || 0,
            },
            currentUserReaction: reactionMap.get(post.post_postid) || null,
          };

          // Add rating for review posts
          if (post.post_type === PostType.REVIEW && post.post_rating) {
            result.rating = post.post_rating;
          }

          // Add locationId if exists
          if (post.post_locationid) {
            result.locationId = post.post_locationid;
          }

          // Add eventId if exists
          if (post.post_eventid) {
            result.eventId = post.post_eventid;
          }

          return result;
        });
      } else {
        processedPosts = posts.map((post) => {
          const result: any = {
            postId: post.post_postid,
            content: post.post_content,
            imageUrls: post.post_imageurls,
            type: post.post_type,
            isVerified: post.post_isverified,
            createdAt: post.post_createdat,
            updatedAt: post.post_updatedat,
            author: {
              id: post.author_id,
              firstName: post.author_firstname,
              lastName: post.author_lastname,
              avatarUrl: post.author_avatarurl,
            },
            analytics: {
              totalUpvotes: post.analytic_total_upvotes || 0,
              totalDownvotes: post.analytic_total_downvotes || 0,
              totalComments: post.analytic_total_comments || 0,
            },
            currentUserReaction: null,
          };

          // Add rating for review posts
          if (post.post_type === PostType.REVIEW && post.post_rating) {
            result.rating = post.post_rating;
          }

          // Add locationId if exists
          if (post.post_locationid) {
            result.locationId = post.post_locationid;
          }

          // Add eventId if exists
          if (post.post_eventid) {
            result.eventId = post.post_eventid;
          }

          return result;
        });
      }

      return {
        data: processedPosts,
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async createPost(dto: CreatePostDto): Promise<any> {
    try {
      // Validate: Blog posts must have visibility
      if (dto.type === PostType.BLOG && !dto.visibility) {
        throw new BadRequestException('Visibility is required for blog posts');
      }

      // Validate: Review posts must have locationId or eventId and rating
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

          return savedPost;
        },
      );

      return result.postId;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  private async updateEntityRating(
    entityId: string,
    entityType: AnalyticEntityType,
    transactionalEntityManager: any,
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
      const result = await this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoin(
          'analytic',
          'analytic',
          'analytic.entity_id::uuid = post.post_id AND analytic.entity_type = :type',
          { type: AnalyticEntityType.POST },
        )
        .where('post.post_id = :postId', { postId })
        .select([
          'post.postId',
          'post.content',
          'post.createdAt',
          'post.updatedAt',
          'author.id',
          'author.firstName',
          'author.lastName',
          'author.avatarUrl',
          'analytic.total_upvotes',
          'analytic.total_downvotes',
          'analytic.total_comments',
        ])
        .getRawOne();
      if (!result) {
        throw new NotFoundException('Post not found');
      }
      return result;
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
      const page = Math.max(params.page ?? 1, 1);
      const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
      const skip = (page - 1) * limit;

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
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
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
      const page = Math.max(params.page ?? 1, 1);
      const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
      const skip = (page - 1) * limit;

      const postsQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoin(
          'analytic',
          'analytic',
          'analytic.entity_id::uuid = post.post_id AND analytic.entity_type = :analyticType',
          { analyticType: AnalyticEntityType.POST },
        )
        .where('post.author_id = :authorId', { authorId });

      // Add type filter if specified
      if (postType) {
        postsQuery.andWhere('post.type = :postType', { postType });
      }

      postsQuery
        .select([
          'post.post_id as post_postid',
          'post.content as post_content',
          'post.image_urls as post_imageurls',
          'post.type as post_type',
          'post.created_at as post_createdat',
          'post.updated_at as post_updatedat',
          'author.id as author_id',
          'author.first_name as author_firstname',
          'author.last_name as author_lastname',
          'author.avatar_url as author_avatarurl',
          'analytic.total_upvotes as analytic_total_upvotes',
          'analytic.total_downvotes as analytic_total_downvotes',
          'analytic.total_comments as analytic_total_comments',
        ])
        .orderBy('post.createdAt', 'DESC')
        .offset(skip)
        .limit(limit);

      const countQuery = this.postRepository.repo
        .createQueryBuilder('post')
        .where('post.author_id = :authorId', { authorId });

      if (postType) {
        countQuery.andWhere('post.type = :postType', { postType });
      }

      const total = await countQuery.getCount();
      const posts = await postsQuery.getRawMany();

      if (!posts.length) {
        return {
          data: [],
          meta: {
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1,
          },
        };
      }

      let processedPosts: any[];

      if (currentUserId) {
        const postIds = posts.map((post) => post.post_postid);

        const userReactions = await this.reactRepository.repo
          .createQueryBuilder('react')
          .where('react.entityId IN (:...postIds)', { postIds })
          .andWhere('react.entityType = :entityType', {
            entityType: ReactEntityType.POST,
          })
          .andWhere('react.authorId = :currentUserId', { currentUserId })
          .select(['react.entityId', 'react.type'])
          .getMany();

        const reactionMap = new Map();
        userReactions.forEach((reaction) => {
          reactionMap.set(reaction.entityId, reaction.type);
        });

        processedPosts = posts.map((post) => {
          return {
            postId: post.post_postid,
            content: post.post_content,
            imageUrls: post.post_imageurls,
            type: post.post_type,
            createdAt: post.post_createdat,
            updatedAt: post.post_updatedat,
            author: {
              id: post.author_id,
              firstName: post.author_firstname,
              lastName: post.author_lastname,
              avatarUrl: post.author_avatarurl,
            },
            analytics: {
              totalUpvotes: post.analytic_total_upvotes || 0,
              totalDownvotes: post.analytic_total_downvotes || 0,
              totalComments: post.analytic_total_comments || 0,
            },
            currentUserReaction: reactionMap.get(post.post_postid) || null,
          };
        });
      } else {
        processedPosts = posts.map((post) => {
          return {
            postId: post.post_postid,
            content: post.post_content,
            imageUrls: post.post_imageurls,
            type: post.post_type,
            createdAt: post.post_createdat,
            updatedAt: post.post_updatedat,
            author: {
              id: post.author_id,
              firstName: post.author_firstname,
              lastName: post.author_lastname,
              avatarUrl: post.author_avatarurl,
            },
            analytics: {
              totalUpvotes: post.analytic_total_upvotes || 0,
              totalDownvotes: post.analytic_total_downvotes || 0,
              totalComments: post.analytic_total_comments || 0,
            },
            currentUserReaction: null,
          };
        });
      }

      return {
        data: processedPosts,
        meta: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
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
}
