import { CreateLocationRequestFromBusinessDto } from '@/common/dto/business/CreateLocationRequestFromBusiness.dto';
import { LocationRequestResponseDto } from '@/common/dto/business/res/LocationRequest.response.dto';
import { DeleteResult, UpdateResult } from 'typeorm';
import { UpdateLocationRequestDto } from '@/common/dto/business/UpdateLocationRequest.dto';
import { CancelLocationRequestDto } from '@/common/dto/business/CancelLocationRequest.dto';
import { ProcessLocationRequestDto } from '@/common/dto/business/ProcessLocationRequest.dto';
import { LocationRequestTagsResponseDto } from '@/common/dto/business/res/LocationRequestTags.response.dto';
import { AddLocationRequestTagsDto } from '@/common/dto/business/AddLocationRequestTags.dto';
import { DeleteLocationRequestTagDto } from '@/common/dto/business/DeleteLocationRequestTag.dto';
import { CreateLocationRequestFromUserDto } from '@/common/dto/business/CreateLocationRequestFromUser.dto';

export const ILocationRequestManagementService = Symbol(
  'ILocationRequestManagementService',
);
export interface ILocationRequestManagementService {
  createLocationRequestFromBusiness(
    dto: CreateLocationRequestFromBusinessDto,
  ): Promise<LocationRequestResponseDto>;

  createLocationRequestFromUser(
    dto: CreateLocationRequestFromUserDto,
  ): Promise<LocationRequestResponseDto>;

  addLocationRequestTags(
    dto: AddLocationRequestTagsDto,
  ): Promise<LocationRequestTagsResponseDto[]>;

  deleteLocationRequestTag(
    dto: DeleteLocationRequestTagDto,
  ): Promise<DeleteResult>;

  updateLocationRequest(dto: UpdateLocationRequestDto): Promise<UpdateResult>;

  cancelLocationRequest(dto: CancelLocationRequestDto): Promise<UpdateResult>;

  processLocationRequest(dto: ProcessLocationRequestDto): Promise<UpdateResult>;
}
