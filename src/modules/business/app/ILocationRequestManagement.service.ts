import { CreateLocationRequestDto } from '@/common/dto/business/CreateLocationRequest.dto';
import { LocationRequestResponseDto } from '@/common/dto/business/res/LocationRequest.response.dto';
import { DeleteResult, UpdateResult } from 'typeorm';
import { UpdateLocationRequestDto } from '@/common/dto/business/UpdateLocationRequest.dto';
import { CancelLocationRequestDto } from '@/common/dto/business/CancelLocationRequest.dto';
import { Paginated, PaginateQuery } from 'nestjs-paginate';
import { GetLocationRequestToProcessByIdDto } from '@/common/dto/business/GetLocationRequestToProcessById.dto';
import { ProcessLocationRequestDto } from '@/common/dto/business/ProcessLocationRequest.dto';
import { LocationRequestTagsResponseDto } from '@/common/dto/business/res/LocationRequestTags.response.dto';
import { AddLocationRequestTagsDto } from '@/common/dto/business/AddLocationRequestTags.dto';
import { DeleteLocationRequestTagDto } from '@/common/dto/business/DeleteLocationRequestTag.dto';

export const ILocationRequestManagementService = Symbol(
  'ILocationRequestManagementService',
);
export interface ILocationRequestManagementService {
  createLocationRequest(
    dto: CreateLocationRequestDto,
  ): Promise<LocationRequestResponseDto>;

  addLocationRequestTags(
    dto: AddLocationRequestTagsDto,
  ): Promise<LocationRequestTagsResponseDto[]>;

  deleteLocationRequestTag(
    dto: DeleteLocationRequestTagDto,
  ): Promise<DeleteResult>;

  updateLocationRequest(dto: UpdateLocationRequestDto): Promise<UpdateResult>;

  cancelLocationRequest(dto: CancelLocationRequestDto): Promise<UpdateResult>;

  getMyLocationRequests(
    accountId: string,
    query: PaginateQuery,
  ): Promise<Paginated<LocationRequestResponseDto>>;

  searchAllLocationRequests(
    query: PaginateQuery,
  ): Promise<Paginated<LocationRequestResponseDto>>;

  getLocationRequestToProcessById(
    dto: GetLocationRequestToProcessByIdDto,
  ): Promise<LocationRequestResponseDto>;

  processLocationRequest(dto: ProcessLocationRequestDto): Promise<UpdateResult>;
}
