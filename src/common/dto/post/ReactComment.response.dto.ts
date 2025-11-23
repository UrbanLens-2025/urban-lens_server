import { Exclude, Expose } from 'class-transformer';
import { ReactType } from '@/modules/post/domain/React.entity';

@Exclude()
export class ReactCommentResponseDto {
  @Expose()
  commentId: string;

  @Expose()
  reactionType: ReactType;

  @Expose()
  message: string;
}
