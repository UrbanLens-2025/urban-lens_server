import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class FavoriteLocationResponseDto {
  @Expose()
  id: string;

  @Expose()
  @Type(() => LocationResponseDto)
  location: LocationResponseDto;

  @Expose()
  createdAt: Date;
}

