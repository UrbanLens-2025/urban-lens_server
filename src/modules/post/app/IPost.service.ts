import { CreatePostDto } from '@/common/dto/post/CreatePost.dto';
import { UpdatePostDto } from '@/common/dto/post/UpdatePost.dto';
import { DeletePostDto } from '@/common/dto/post/DeletePost.dto';
import { ReactPostDto } from '@/common/dto/post/ReactPost.dto';
import { GetMyPostsQueryDto } from '@/common/dto/post/GetMyPostsQuery.dto';
import {
  PaginationParams,
  PaginationResult,
} from '@/common/services/base.service';
import { PostResponseDto } from '@/common/dto/post/Post.response.dto';
import { ReactPostResponseDto } from '@/common/dto/post/ReactPost.response.dto';
import { DeletePostResponseDto } from '@/common/dto/post/DeletePost.response.dto';
import { UpdatePostVisibilityResponseDto } from '@/common/dto/post/UpdatePostVisibility.response.dto';
import { PostAuthorResponseDto } from '@/common/dto/post/Post.response.dto';
import { BanPostResponseDto } from '@/common/dto/post/BanPost.response.dto';
import { EntityManager } from 'typeorm';

export const IPostService = Symbol('IPostService');
export interface IPostService {
  getBasicFeed(
    params: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginationResult<PostResponseDto>>;
  getFollowingFeed(
    currentUserId: string,
    params: PaginationParams,
  ): Promise<PaginationResult<PostResponseDto>>;
  createPost(dto: CreatePostDto): Promise<PostResponseDto>;
  updatePost(
    postId: string,
    dto: UpdatePostDto,
    userId: string,
  ): Promise<PostResponseDto>;
  getPostById(postId: string, userId?: string): Promise<PostResponseDto>;
  reactPost(dto: ReactPostDto): Promise<ReactPostResponseDto>;
  deletePost(dto: DeletePostDto): Promise<DeletePostResponseDto>;
  getUpvotesOfPost(
    postId: string,
    params?: PaginationParams,
  ): Promise<PaginationResult<PostAuthorResponseDto>>;
  getDownvotesOfPost(
    postId: string,
    params?: PaginationParams,
  ): Promise<PaginationResult<PostAuthorResponseDto>>;
  getAllReactionsOfPost(postId: string): Promise<{
    upvotes: PostAuthorResponseDto[];
    downvotes: PostAuthorResponseDto[];
  }>;
  getMyPosts(
    authorId: string,
    filterQuery: GetMyPostsQueryDto,
    params: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginationResult<PostResponseDto>>;
  getPostByAuthorId(
    authorId: string,
    params: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginationResult<PostResponseDto>>;
  getReviewsByAuthorId(
    authorId: string,
    params: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginationResult<PostResponseDto>>;
  getBlogsByAuthorId(
    authorId: string,
    params: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginationResult<PostResponseDto>>;
  getAllPosts(
    params: PaginationParams,
  ): Promise<PaginationResult<PostResponseDto>>;
  getReviews(
    locationId: string | undefined,
    eventId: string | undefined,
    params: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginationResult<PostResponseDto>>;
  getPostsByLocation(
    locationId: string,
    params: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginationResult<PostResponseDto>>;
  updatePostVisibility(
    postId: string,
    isHidden: boolean,
  ): Promise<UpdatePostVisibilityResponseDto>;
  banPost(
    postId: string,
    reason?: string,
    entityManager?: EntityManager,
  ): Promise<BanPostResponseDto>;
}
