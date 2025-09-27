import { CreateCommentRequestDto } from '@/common/dto/post/CreateCommentRequest.dto';
import type { PaginationParams } from '@/common/services/base.service';
import { ReactCommentRequestDto } from '@/common/dto/post/ReactCommentRequest.dto';
import { DeleteCommentRequestDto } from '@/common/dto/post/DeleteCommentRequest.dto';

export const ICommentService = Symbol('ICommentService');

export interface ICommentService {
  createComment(dto: CreateCommentRequestDto): Promise<any>;
  getCommentsByPostId(postId: string, params: PaginationParams): Promise<any>;
  reactComment(dto: ReactCommentRequestDto): Promise<any>;
  deleteComment(dto: DeleteCommentRequestDto): Promise<any>;
  getLikesOfComment(commentId: string): Promise<any>;
  getDislikesOfComment(commentId: string): Promise<any>;
}
