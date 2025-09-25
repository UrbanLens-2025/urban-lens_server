import { CreateCommentRequestDto } from '@/common/dto/post/CreateCommentRequest.dto';
import type { PaginationParams } from '@/common/services/base.service';
import { ReactCommentRequestDto } from '@/common/dto/post/ReactCommentRequest.dto';

export const ICommentService = Symbol('ICommentService');

export interface ICommentService {
  createComment(dto: CreateCommentRequestDto): Promise<any>;
  getCommentsByPostId(postId: string, params: PaginationParams): Promise<any>;
  deleteComment(commentId: string, userId: string): Promise<any>;
  reactComment(dto: ReactCommentRequestDto): Promise<any>;
}
