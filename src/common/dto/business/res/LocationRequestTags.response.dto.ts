import { LocationRequestResponseDto } from '@/common/dto/business/res/LocationRequest.response.dto';
import { TagResponseDto } from '@/common/dto/account/TagResponse.dto';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class LocationRequestTagsResponseDto {
  @Expose()
  id: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  locationRequestId: string;

  @Expose()
  @Type(() => LocationRequestResponseDto)
  locationRequest: LocationRequestResponseDto;

  @Expose()
  tagId: number;

  @Expose()
  @Type(() => TagResponseDto)
  tag: TagResponseDto;
}
