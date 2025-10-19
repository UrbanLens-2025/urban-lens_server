import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LocationWithDistanceResponseDto extends LocationResponseDto {
  @Expose()
  distanceMeters?: number;
}
