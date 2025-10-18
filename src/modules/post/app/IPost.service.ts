import { CreatePostDto } from '@/common/dto/post/CreatePost.dto';
import { DeletePostDto } from '@/common/dto/post/DeletePost.dto';
import { ReactPostDto } from '@/common/dto/post/ReactPost.dto';
import {
  PaginationParams,
  PaginationResult,
} from '@/common/services/base.service';
import { Paginated, PaginateQuery } from 'nestjs-paginate';
import { PostEntity } from '@/modules/post/domain/Post.entity';

export const IPostService = Symbol('IPostService');
export interface IPostService {
  getBasicFeed(
    params: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginationResult<any>>;
  createPost(dto: CreatePostDto): Promise<any>;
  getPostById(postId: string): Promise<any>;
  reactPost(dto: ReactPostDto): Promise<any>;
  deletePost(dto: DeletePostDto): Promise<any>;
  getUpvotesOfPost(postId: string, params?: PaginationParams): Promise<any>;
  getDownvotesOfPost(postId: string, params?: PaginationParams): Promise<any>;
  getAllReactionsOfPost(postId: string): Promise<any>;
  getPostByAuthorId(
    authorId: string,
    params: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginationResult<any>>;
  getReviewsByAuthorId(
    authorId: string,
    params: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginationResult<any>>;
  getBlogsByAuthorId(
    authorId: string,
    params: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginationResult<any>>;
  getAllPosts(params: PaginationParams): Promise<PaginationResult<any>>;
  getReviews(
    locationId: string | undefined,
    eventId: string | undefined,
    params: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginationResult<any>>;
  updatePostVisibility(postId: string, isHidden: boolean): Promise<any>;
}
