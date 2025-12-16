import { CreateCommentRequestDto } from '@/common/dto/post/CreateComment.dto';
import type {
  PaginationParams,
  PaginationResult,
} from '@/common/services/base.service';
import { ReactCommentRequestDto } from '@/common/dto/post/ReactComment.dto';
import { DeleteCommentRequestDto } from '@/common/dto/post/DeleteComment.dto';
import { CommentResponseDto } from '@/common/dto/post/Comment.response.dto';
import { ReactCommentResponseDto } from '@/common/dto/post/ReactComment.response.dto';
import { DeleteCommentResponseDto } from '@/common/dto/post/DeleteComment.response.dto';
import { PostAuthorResponseDto } from '@/common/dto/post/Post.response.dto';

export const ICommentService = Symbol('ICommentService');

export interface ICommentService {
  createComment(dto: CreateCommentRequestDto): Promise<CommentResponseDto>;
  createBusinessOwnerComment(
    dto: CreateCommentRequestDto,
    businessOwnerAccountId: string,
  ): Promise<CommentResponseDto>;
  getCommentsByPostId(
    postId: string,
    params: PaginationParams,
  ): Promise<PaginationResult<CommentResponseDto>>;
  reactComment(dto: ReactCommentRequestDto): Promise<ReactCommentResponseDto>;
  deleteComment(
    dto: DeleteCommentRequestDto,
  ): Promise<DeleteCommentResponseDto>;
  getUpvotesOfComment(
    commentId: string,
    params?: PaginationParams,
  ): Promise<PaginationResult<PostAuthorResponseDto>>;
  getDownvotesOfComment(
    commentId: string,
    params?: PaginationParams,
  ): Promise<PaginationResult<PostAuthorResponseDto>>;
}
