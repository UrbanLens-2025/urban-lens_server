import { CreateCommentRequestDto } from '@/common/dto/post/CreateComment.dto';
import type { PaginationParams } from '@/common/services/base.service';
import { ReactCommentRequestDto } from '@/common/dto/post/ReactComment.dto';
import { DeleteCommentRequestDto } from '@/common/dto/post/DeleteComment.dto';

export const ICommentService = Symbol('ICommentService');

export interface ICommentService {
  createComment(dto: CreateCommentRequestDto): Promise<any>;
  getCommentsByPostId(postId: string, params: PaginationParams): Promise<any>;
  reactComment(dto: ReactCommentRequestDto): Promise<any>;
  deleteComment(dto: DeleteCommentRequestDto): Promise<any>;
  getUpvotesOfComment(
    commentId: string,
    params?: PaginationParams,
  ): Promise<any>;
  getDownvotesOfComment(
    commentId: string,
    params?: PaginationParams,
  ): Promise<any>;
}
