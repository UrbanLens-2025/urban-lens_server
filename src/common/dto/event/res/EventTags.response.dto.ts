import { Exclude, Expose, Type } from 'class-transformer';
import { TagResponseDto } from '@/common/dto/account/res/TagResponse.dto';
import { EventResponseDto } from '@/common/dto/event/res/Event.response.dto';

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
  tagId: number;

  @Expose()
  @Type(() => EventResponseDto)
  event: EventResponseDto;

  @Expose()
  @Type(() => TagResponseDto)
  tag: TagResponseDto;
}
