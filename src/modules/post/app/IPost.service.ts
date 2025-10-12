import { CreatePostDto } from '@/common/dto/post/CreatePost.dto';
import { DeletePostDto } from '@/common/dto/post/DeletePost.dto';
import { ReactPostDto } from '@/common/dto/post/ReactPost.dto';
import {
  PaginationParams,
  PaginationResult,
} from '@/common/services/base.service';

export const IPostService = Symbol('IPostService');
export interface IPostService {
  createPost(dto: CreatePostDto): Promise<any>;
  getPostById(postId: string): Promise<any>;
  reactPost(dto: ReactPostDto): Promise<any>;
  deletePost(dto: DeletePostDto): Promise<any>;
  getLikesOfPost(postId: string): Promise<any>;
  getDislikesOfPost(postId: string): Promise<any>;
  getAllReactionsOfPost(postId: string): Promise<any>;
  getPostByAuthorId(
    authorId: string,
    params: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginationResult<any>>;
}
