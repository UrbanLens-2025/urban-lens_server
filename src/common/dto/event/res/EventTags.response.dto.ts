import { Exclude, Expose, Type } from 'class-transformer';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';
import { TagCategoryResponseDto } from '@/common/dto/utility/TagCategory.dto';

@Exclude()
export class EventTagsResponseDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  eventId: string;

  @Expose()
  tagCategoryId: number;

  @Expose()
  @Type(() => EventResponseDto)
  event: EventResponseDto;

  @Expose()
  @Type(() => TagCategoryResponseDto)
  tagCategory: TagCategoryResponseDto;
}
