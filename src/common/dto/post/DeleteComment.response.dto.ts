import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DeleteCommentResponseDto {
  @Expose()
  commentId: string;

  @Expose()
  message: string;
}
