import { AddLocationBookingConfigDto } from '@/common/dto/location-availability/AddLocationBookingConfig.dto';
import { LocationBookingConfigResponseDto } from '@/common/dto/location-availability/res/LocationBooking.response.dto';
import { UpdateLocationBookingConfigDto } from '@/common/dto/location-availability/UpdateLocationBookingConfig.dto';
import { UpdateResult } from 'typeorm';
import { GetLocationBookingConfigDto } from '@/common/dto/location-availability/GetLocationBookingConfig.dto';

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
