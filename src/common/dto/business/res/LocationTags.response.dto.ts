import { TagResponseDto } from '@/common/dto/account/res/TagResponse.dto';
import { Exclude, Expose, Type } from 'class-transformer';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';

@Exclude()
export class LocationTagsResponseDto {
  @Expose()
  id: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  locationId: string;

  @Expose()
  @Type(() => LocationResponseDto)
  location: LocationResponseDto;

  @Expose()
  tagId: number;

  @Expose()
  @Type(() => TagResponseDto)
  tag: TagResponseDto;
}
