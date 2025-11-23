import { Exclude, Expose } from 'class-transformer';
import { ReactType } from '@/modules/post/domain/React.entity';

@Exclude()
export class ReactPostResponseDto {
  @Expose()
  postId: string;

  @Expose()
  reactionType: ReactType;

  @Expose()
  message: string;
}
