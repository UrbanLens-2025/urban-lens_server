import { CreateLocationDto } from '@/common/dto/location/CreateLocation.dto';
import { GetLocationsQueryDto } from '@/common/dto/location/GetLocationsQuery.dto';
import { UpdateLocationDto } from '@/common/dto/location/UpdateLocation.dto';
import { UpdateLocationStatusDto } from '@/common/dto/location/UpdateLocationStatus.dto';
import { PaginationResult } from '@/common/services/base.service';
import { ILocationService } from '@/modules/business/app/ILocation.service';
import { LocationEntity } from '../../domain/Location.entity';

export class LocationV2Service implements ILocationService {
  createLocation(
    createLocationDto: CreateLocationDto,
    businessOwnerId: string,
  ): Promise<LocationEntity> {
    throw new Error('Method not implemented.');
  }
  getLocationById(locationId: string): Promise<LocationEntity> {
    throw new Error('Method not implemented.');
  }
  getLocationsByBusinessId(
    businessId: string,
    queryParams: GetLocationsQueryDto,
  ): Promise<PaginationResult<LocationEntity>> {
    throw new Error('Method not implemented.');
  }
  updateLocation(
    locationId: string,
    updateLocationDto: UpdateLocationDto,
    businessOwnerId: string,
  ): Promise<LocationEntity> {
    throw new Error('Method not implemented.');
  }
  deleteLocation(locationId: string, businessOwnerId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getLocationsWithFilters(
    queryParams: GetLocationsQueryDto,
  ): Promise<PaginationResult<LocationEntity>> {
    throw new Error('Method not implemented.');
  }
  updateLocationStatus(
    locationId: string,
    updateStatusDto: UpdateLocationStatusDto,
    adminId: string,
  ): Promise<LocationEntity> {
    throw new Error('Method not implemented.');
  }
  updateLocationByOwner(
    locationId: string,
    updateLocationDto: UpdateLocationDto,
    businessOwnerId: string,
  ): Promise<LocationEntity> {
    throw new Error('Method not implemented.');
  }
}
