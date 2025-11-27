import { LocationBookingConfigResponseDto } from '@/common/dto/location-booking/res/LocationBookingConfig.response.dto';
import { UpdateLocationBookingConfigDto } from '@/common/dto/location-booking/UpdateLocationBookingConfig.dto';
import { UpdateResult } from 'typeorm';
import { GetLocationBookingConfigDto } from '@/common/dto/location-booking/GetLocationBookingConfig.dto';
import { CreateDefaultLocationBookingConfigDto } from '@/common/dto/location-booking/CreateDefaultLocationBookingConfig.dto';

export const ILocationBookingConfigManagementService = Symbol(
  'ILocationBookingConfigManagementService',
);
export interface ILocationBookingConfigManagementService {
  updateConfig(dto: UpdateLocationBookingConfigDto): Promise<UpdateResult>;
  getConfig(
    dto: GetLocationBookingConfigDto,
  ): Promise<LocationBookingConfigResponseDto>;

  createDefaultLocationBookingConfig(
    dto: CreateDefaultLocationBookingConfigDto,
  ): Promise<void>;
}
