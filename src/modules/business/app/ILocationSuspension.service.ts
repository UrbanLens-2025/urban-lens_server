import { GetAllSuspensionsDto } from '@/common/dto/business/GetAllSuspensions.dto';
import { LocationSuspensionResponseDto } from '@/common/dto/business/res/LocationSuspension.response.dto';
import { SuspendLocationDto } from '@/common/dto/business/SuspendLocation.dto';
import { SuspendLocationBookingDto } from '@/common/dto/location-booking/SuspendLocationBooking.dto';
import { UpdateLocationSuspensionDto } from '@/common/dto/location-booking/UpdateLocationSuspension.dto';
import { LocationSuspensionEntity } from '@/modules/business/domain/LocationSuspension.entity';
import { PaginateConfig, Paginated } from 'nestjs-paginate';

export const ILocationSuspensionService = Symbol('ILocationSuspensionService');

export interface ILocationSuspensionService {
  suspendLocationBooking(
    dto: SuspendLocationBookingDto,
  ): Promise<LocationSuspensionResponseDto>;

  updateLocationSuspension(
    dto: UpdateLocationSuspensionDto,
  ): Promise<LocationSuspensionResponseDto>;

  suspendLocation(
    dto: SuspendLocationDto,
  ): Promise<LocationSuspensionResponseDto>;

  getAllSuspensions(
    dto: GetAllSuspensionsDto,
  ): Promise<Paginated<LocationSuspensionResponseDto>>;
}

export namespace ILocationSuspensionService_QueryConfig {
  export function getAllSuspensions(): PaginateConfig<LocationSuspensionEntity> {
    return {
      sortableColumns: ['createdAt', 'suspendedUntil'],
      defaultSortBy: [['createdAt', 'DESC']],
      filterableColumns: {
        locationId: true,
      },
    };
  }
}
