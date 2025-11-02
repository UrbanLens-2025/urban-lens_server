import { AddLocationBookingConfigDto } from '@/common/dto/location-booking/AddLocationBookingConfig.dto';
import { LocationBookingConfigResponseDto } from '@/common/dto/location-booking/res/LocationBookingConfig.response.dto';
import { UpdateLocationBookingConfigDto } from '@/common/dto/location-booking/UpdateLocationBookingConfig.dto';
import { UpdateResult } from 'typeorm';
import { GetLocationBookingConfigDto } from '@/common/dto/location-booking/GetLocationBookingConfig.dto';

export const ILocationBookingConfigManagementService = Symbol(
  'ILocationBookingConfigManagementService',
);
export interface ILocationBookingConfigManagementService {
  addConfig(
    dto: AddLocationBookingConfigDto,
  ): Promise<LocationBookingConfigResponseDto>;
  updateConfig(dto: UpdateLocationBookingConfigDto): Promise<UpdateResult>;
  getConfig(
    dto: GetLocationBookingConfigDto,
  ): Promise<LocationBookingConfigResponseDto>;
}
