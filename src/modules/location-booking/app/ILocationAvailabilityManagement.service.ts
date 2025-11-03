import { AddLocationAvailabilityDto } from '@/common/dto/location-booking/AddLocationAvailability.dto';
import { LocationAvailabilityResponseDto } from '@/common/dto/location-booking/res/LocationAvailability.response.dto';
import { RemoveLocationAvailabilityDto } from '@/common/dto/location-booking/RemoveLocationAvailability.dto';
import { GetAvailabilityForLocationDto } from '@/common/dto/location-booking/GetAvailabilityForLocation.dto';
import { UpdateLocationAvailabilityStatusDto } from '@/common/dto/location-booking/UpdateLocationAvailabilityStatus.dto';

export const ILocationAvailabilityManagementService = Symbol(
  'IManualLocationManagementService',
);
export interface ILocationAvailabilityManagementService {
  addLocationAvailability(
    dto: AddLocationAvailabilityDto,
  ): Promise<LocationAvailabilityResponseDto>;

  removeLocationAvailability(
    dto: RemoveLocationAvailabilityDto,
  ): Promise<LocationAvailabilityResponseDto>;

  getAvailabilityForLocation(
    dto: GetAvailabilityForLocationDto,
  ): Promise<LocationAvailabilityResponseDto[]>;

  updateLocationAvailability(
    dto: UpdateLocationAvailabilityStatusDto,
  ): Promise<LocationAvailabilityResponseDto>;
}
