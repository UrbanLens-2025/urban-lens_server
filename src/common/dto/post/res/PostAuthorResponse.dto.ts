import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PostAuthorResponseDto {
  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  avatarUrl: string | null;

  @Expose()
  isFollow?: boolean;
}

