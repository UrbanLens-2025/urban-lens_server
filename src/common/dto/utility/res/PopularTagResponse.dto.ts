import { Expose } from 'class-transformer';
import { TagGroup } from '@/common/constants/TagGroup.constant';

export class PopularTagResponseDto {
  @Expose()
  id: number;

  @Expose()
  groupName: TagGroup;

  @Expose()
  displayName: string;

  @Expose()
  color: string;

  @Expose()
  icon: string;

  @Expose()
  isSelectable: boolean;

  @Expose()
  usageCount: number;
}
