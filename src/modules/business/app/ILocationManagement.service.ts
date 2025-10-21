import { UpdateLocationDto } from '@/common/dto/business/UpdateLocation.dto';
import { UpdateResult } from 'typeorm';
import { LocationTagsResponseDto } from '@/common/dto/business/res/LocationTags.response.dto';
import { AddLocationTagDto } from '@/common/dto/business/AddLocationTag.dto';
import { RemoveLocationTagDto } from '@/common/dto/business/RemoveLocationTag.dto';
import { ForceUpdateLocationDto } from '@/common/dto/business/ForceUpdateLocation.dto';
import { LocationResponseDto } from '@/common/dto/business/res/Location.response.dto';
import { CreatePublicLocationDto } from '@/common/dto/business/CreatePublicLocation.dto';

export const ILocationManagementService = Symbol('ILocationManagementService');
export interface ILocationManagementService {
  updateOwnedLocation(dto: UpdateLocationDto): Promise<UpdateResult>;
  addTag(dto: AddLocationTagDto): Promise<LocationTagsResponseDto[]>;
  softRemoveTag(dto: RemoveLocationTagDto): Promise<UpdateResult>;
  forceUpdateLocation(dto: ForceUpdateLocationDto): Promise<UpdateResult>;
  createPublicLocation(
    dto: CreatePublicLocationDto,
  ): Promise<LocationResponseDto>;
}
