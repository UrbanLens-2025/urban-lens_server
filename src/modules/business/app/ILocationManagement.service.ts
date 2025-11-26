import { UpdateLocationDto } from '@/common/dto/business/UpdateLocation.dto';
import { EntityManager, UpdateResult } from 'typeorm';
import { LocationTagsResponseDto } from '@/common/dto/business/res/LocationTags.response.dto';
import { AddLocationTagDto } from '@/common/dto/business/AddLocationTag.dto';
import { RemoveLocationTagDto } from '@/common/dto/business/RemoveLocationTag.dto';
import { ForceUpdateLocationDto } from '@/common/dto/business/ForceUpdateLocation.dto';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { CreatePublicLocationDto } from '@/common/dto/business/CreatePublicLocation.dto';
import { LocationRequestEntity } from '@/modules/business/domain/LocationRequest.entity';
import { LocationEntity } from '@/modules/business/domain/Location.entity';
import { CreateBatchPublicLocationDto } from '@/common/dto/business/CreateBatchPublicLocation.dto';

export const ILocationManagementService = Symbol('ILocationManagementService');
export interface ILocationManagementService {
  updateOwnedLocation(dto: UpdateLocationDto): Promise<UpdateResult>;
  addTag(dto: AddLocationTagDto): Promise<LocationTagsResponseDto[]>;
  softRemoveTag(dto: RemoveLocationTagDto): Promise<UpdateResult>;
  forceUpdateLocation(dto: ForceUpdateLocationDto): Promise<UpdateResult>;
  createPublicLocation(
    dto: CreatePublicLocationDto,
  ): Promise<LocationResponseDto>;
  createManyPublicLocations(
    dto: CreateBatchPublicLocationDto,
  ): Promise<LocationResponseDto[]>;

  convertLocationRequestToLocationEntity(
    em: EntityManager,
    locationRequest: LocationRequestEntity,
  ): Promise<LocationEntity>;
}
