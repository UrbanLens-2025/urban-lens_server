import { Expose } from 'class-transformer';

export class TagResponseDto {
  @Expose()
  id: number;
  @Expose()
  groupName: string;
  @Expose()
  displayName: string;
  @Expose()
  color: string;
  @Expose()
  icon: string;
}
