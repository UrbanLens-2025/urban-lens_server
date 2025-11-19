import { Paginated, PaginateQuery, PaginateConfig } from 'nestjs-paginate';
import { PostResponseDto } from '@/common/dto/post/res/PostResponse.dto';
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
import { PostEntity } from '@/modules/post/domain/Post.entity';
import { CommentEntity } from '@/modules/post/domain/Comment.entity';
import { ReactEntity } from '@/modules/post/domain/React.entity';

export const IPostQueryService = Symbol('IPostQueryService');

export interface IPostQueryService {
  getBasicFeed(dto: GetBasicFeedDto): Promise<Paginated<PostResponseDto>>;
  getFollowingFeed(
    dto: GetFollowingFeedDto,
  ): Promise<Paginated<PostResponseDto>>;
  getPostById(dto: GetPostByIdDto): Promise<PostResponseDto>;
  getMyPosts(dto: GetMyPostsDto): Promise<Paginated<PostResponseDto>>;
  getPostByAuthorId(
    dto: GetPostByAuthorIdDto,
  ): Promise<Paginated<PostResponseDto>>;
  getReviewsByAuthorId(
    dto: GetPostByAuthorIdDto,
  ): Promise<Paginated<PostResponseDto>>;
  getBlogsByAuthorId(
    dto: GetPostByAuthorIdDto,
  ): Promise<Paginated<PostResponseDto>>;
  getAllPosts(query: PaginateQuery): Promise<Paginated<PostResponseDto>>;
  getReviews(dto: GetReviewsDto): Promise<Paginated<PostResponseDto>>;
  getPostsByLocation(
    dto: GetPostsByLocationDto,
  ): Promise<Paginated<PostResponseDto>>;
  getUpvotesOfPost(
    dto: GetReactionsDto,
  ): Promise<Paginated<AccountResponseDto>>;
  getDownvotesOfPost(
    dto: GetReactionsDto,
  ): Promise<Paginated<AccountResponseDto>>;
  getAllReactionsOfPost(dto: GetPostByIdDto): Promise<PostReactionsResponseDto>;
  getCommentsByPostId(
    dto: GetCommentsByPostIdDto,
  ): Promise<Paginated<CommentResponseDto>>;
  getUpvotesOfComment(
    dto: GetCommentReactionsDto,
  ): Promise<Paginated<AccountResponseDto>>;
  getDownvotesOfComment(
    dto: GetCommentReactionsDto,
  ): Promise<Paginated<AccountResponseDto>>;
}

export namespace IPostQueryService_QueryConfig {
  export function getBasicFeed(): PaginateConfig<PostEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [],
    };
  }

  export function getFollowingFeed(): PaginateConfig<PostEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [],
    };
  }

  export function getMyPosts(): PaginateConfig<PostEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [],
    };
  }

  export function getPostByAuthorId(): PaginateConfig<PostEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [],
    };
  }

  export function getReviewsByAuthorId(): PaginateConfig<PostEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [],
    };
  }

  export function getBlogsByAuthorId(): PaginateConfig<PostEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [],
    };
  }

  export function getAllPosts(): PaginateConfig<PostEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [],
    };
  }

  export function getReviews(): PaginateConfig<PostEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [],
    };
  }

  export function getPostsByLocation(): PaginateConfig<PostEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [],
    };
  }

  export function getUpvotesOfPost(): PaginateConfig<ReactEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [],
    };
  }

  export function getDownvotesOfPost(): PaginateConfig<ReactEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [],
    };
  }

  export function getCommentsByPostId(): PaginateConfig<CommentEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [],
    };
  }

  export function getUpvotesOfComment(): PaginateConfig<ReactEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [],
    };
  }

  export function getDownvotesOfComment(): PaginateConfig<ReactEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: [],
    };
  }
}
