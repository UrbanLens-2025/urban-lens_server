import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class DeletePostResponseDto {
  @Expose()
  postId: string;

  @Expose()
  message: string;
}
