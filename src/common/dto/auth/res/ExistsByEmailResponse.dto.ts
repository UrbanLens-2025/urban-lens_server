import { Expose } from 'class-transformer';

export class ExistsByEmailResponseDto {
  @Expose()
  exists: boolean;
}
