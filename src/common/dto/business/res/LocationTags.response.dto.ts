import { LocationRequestResponseDto } from '@/common/dto/business/res/LocationRequest.response.dto';
import { TagResponseDto } from '@/common/dto/account/TagResponse.dto';
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
