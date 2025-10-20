import { UpdateLocationDto } from '@/common/dto/business/UpdateLocation.dto';
import { UpdateResult } from 'typeorm';
import { LocationTagsResponseDto } from '@/common/dto/business/res/LocationTags.response.dto';
import { AddLocationTagDto } from '@/common/dto/business/AddLocationTag.dto';
import { RemoveLocationTagDto } from '@/common/dto/business/RemoveLocationTag.dto';

export const ILocationManagementService = Symbol('ILocationManagementService');
export interface ILocationManagementService {
  updateLocation(dto: UpdateLocationDto): Promise<UpdateResult>;
  addTag(dto: AddLocationTagDto): Promise<LocationTagsResponseDto[]>;
  softRemoveTag(dto: RemoveLocationTagDto): Promise<UpdateResult>;
}
