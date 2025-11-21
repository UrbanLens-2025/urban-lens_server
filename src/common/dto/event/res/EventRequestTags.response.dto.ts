import { Exclude, Expose, Type } from 'class-transformer';
import { EventRequestResponseDto } from '@/common/dto/event/res/EventRequest.response.dto';
import { TagResponseDto } from '@/common/dto/account/res/TagResponse.dto';

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
  tagId: number;

  @Expose()
  @Type(() => EventRequestResponseDto)
  eventRequest: EventRequestResponseDto;

  @Expose()
  @Type(() => TagResponseDto)
  tag: TagResponseDto;
}
