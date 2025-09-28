import { CreatePostRequestDto } from '@/common/dto/post/CreatePostRequest.dto';
import { DeletePostRequestDto } from '@/common/dto/post/DeletePostRequest.dto';
import { ReactPostRequestDto } from '@/common/dto/post/ReactPostRequest.dto';

export const IPostService = Symbol('IPostService');
export interface IPostService {
  createPost(dto: CreatePostRequestDto): Promise<any>;
  getPostById(postId: string): Promise<any>;
  reactPost(dto: ReactPostRequestDto): Promise<any>;
  deletePost(dto: DeletePostRequestDto): Promise<any>;
  getLikesOfPost(postId: string): Promise<any>;
  getDislikesOfPost(postId: string): Promise<any>;
  getAllReactionsOfPost(postId: string): Promise<any>;
}
