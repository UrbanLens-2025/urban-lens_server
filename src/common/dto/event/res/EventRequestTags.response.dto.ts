import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { EventRequestResponseDto } from '@/common/dto/event/res/EventRequest.response.dto';
import { TagCategoryResponseDto } from '@/common/dto/utility/TagCategory.dto';

@Exclude()
export class EventRequestTagsResponseDto {
  @Expose()
  id: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  eventRequestId: string;

  @Expose()
  tagCategoryId: number;

  @Expose()
  @Type(() => EventRequestResponseDto)
  eventRequest: EventRequestResponseDto;

  @Expose()
  @Type(() => TagCategoryResponseDto)
  tagCategory: TagCategoryResponseDto;
}
