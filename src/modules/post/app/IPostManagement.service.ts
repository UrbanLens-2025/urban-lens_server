import { DeletePostDto } from '@/common/dto/post/DeletePost.dto';
import { UpdatePostVisibilityDto } from '@/common/dto/post/UpdatePostVisibility.dto';
import { ReactPostDto } from '@/common/dto/post/ReactPost.dto';
import { ReactCommentRequestDto } from '@/common/dto/post/ReactComment.dto';
import { DeleteCommentRequestDto } from '@/common/dto/post/DeleteComment.dto';

export const IPostManagementService = Symbol('IPostManagementService');

export interface IPostManagementService {
  deletePost(dto: DeletePostDto): Promise<void>;
  updatePostVisibility(dto: UpdatePostVisibilityDto): Promise<void>;
  reactPost(dto: ReactPostDto): Promise<void>;
  reactComment(dto: ReactCommentRequestDto): Promise<void>;
  deleteComment(dto: DeleteCommentRequestDto): Promise<void>;
}
