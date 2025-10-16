import { AddLocationAvailabilityDto } from '@/common/dto/location-availability/AddLocationAvailability.dto';
import { LocationAvailabilityResponseDto } from '@/common/dto/location-availability/res/LocationAvailability.response.dto';
import { UpdateLocationAvailabilityDto } from '@/common/dto/location-availability/UpdateLocationAvailability.dto';
import { UpdateResult } from 'typeorm';
import { RemoveLocationAvailabilityDto } from '@/common/dto/location-availability/RemoveLocationAvailability.dto';
import { GetLocationAvailabilityByMonthYearDto } from '@/common/dto/location-availability/GetLocationAvailabilityByMonthYear.dto';

export const ILocationAvailabilityManagementService = Symbol(
  'IManualLocationManagementService',
);
export interface ILocationAvailabilityManagementService {
  addLocationAvailability(
    dto: AddLocationAvailabilityDto,
  ): Promise<LocationAvailabilityResponseDto>;

  updateLocationAvailability(
    dto: UpdateLocationAvailabilityDto,
  ): Promise<UpdateResult>;

  removeLocationAvailability(
    dto: RemoveLocationAvailabilityDto,
  ): Promise<LocationAvailabilityResponseDto>;

  /**
   * Gets location availability by month and year, fetches one month adjacent to the given month
   * For example:
   * - Given: month = 5, year = 2023
   * - Fetches: from 2023-04-01 to 2023-06-30
   * @param dto
   */
  getLocationAvailabilityByMonthYear(
    dto: GetLocationAvailabilityByMonthYearDto,
  ): Promise<LocationAvailabilityResponseDto[]>;
}
