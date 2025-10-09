import { CreateLocationDto } from '@/common/dto/location/CreateLocation.dto';
import { UpdateLocationDto } from '@/common/dto/location/UpdateLocation.dto';
import { GetLocationsQueryDto } from '@/common/dto/location/GetLocationsQuery.dto';
import { UpdateLocationStatusDto } from '@/common/dto/location/UpdateLocationStatus.dto';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { PaginationResult } from '@/common/services/base.service';

export const ILocationService = Symbol('ILocationService');

export interface ILocationService {
  createLocation(
    createLocationDto: CreateLocationDto,
    businessOwnerId: string,
  ): Promise<LocationEntity>;

  getLocationById(locationId: string): Promise<LocationEntity>;

  getLocationsByBusinessId(
    businessId: string,
    queryParams: GetLocationsQueryDto,
  ): Promise<PaginationResult<LocationEntity>>;

  updateLocation(
    locationId: string,
    updateLocationDto: UpdateLocationDto,
    businessOwnerId: string,
  ): Promise<LocationEntity>;

  deleteLocation(locationId: string, businessOwnerId: string): Promise<void>;

  getLocationsWithFilters(
    queryParams: GetLocationsQueryDto,
  ): Promise<PaginationResult<LocationEntity>>;

  updateLocationStatus(
    locationId: string,
    updateStatusDto: UpdateLocationStatusDto,
    adminId: string,
  ): Promise<LocationEntity>;

  updateLocationByOwner(
    locationId: string,
    updateLocationDto: UpdateLocationDto,
    businessOwnerId: string,
  ): Promise<LocationEntity>;

  getAllLocationsDebug(): Promise<LocationEntity[]>;

  getLocationsSimple(): Promise<PaginationResult<LocationEntity>>;

  getLocationsNoFilters(): Promise<PaginationResult<LocationEntity>>;
}
