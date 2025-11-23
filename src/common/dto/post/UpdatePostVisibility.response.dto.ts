import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UpdatePostVisibilityResponseDto {
  @Expose()
  postId: string;

  @Expose()
  isHidden: boolean;

  @Expose()
  message: string;
}
