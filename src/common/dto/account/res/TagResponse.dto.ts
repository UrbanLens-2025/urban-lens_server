import { Expose } from 'class-transformer';
import { TagGroup } from '@/common/constants/TagGroup.constant';

export class TagResponseDto {
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
}
