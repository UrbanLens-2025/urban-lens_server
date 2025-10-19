import { CreateLocationRequestDto } from '@/common/dto/business/CreateLocationRequest.dto';
import { LocationRequestResponseDto } from '@/common/dto/business/res/LocationRequest.response.dto';
import { DeleteResult, UpdateResult } from 'typeorm';
import { UpdateLocationRequestDto } from '@/common/dto/business/UpdateLocationRequest.dto';
import { CancelLocationRequestDto } from '@/common/dto/business/CancelLocationRequest.dto';
import { Paginated, PaginateQuery } from 'nestjs-paginate';
import { GetAnyLocationRequestByIdDto } from '@/common/dto/business/GetAnyLocationRequestById.dto';
import { ProcessLocationRequestDto } from '@/common/dto/business/ProcessLocationRequest.dto';
import { LocationRequestTagsResponseDto } from '@/common/dto/business/res/LocationRequestTags.response.dto';
import { AddLocationRequestTagsDto } from '@/common/dto/business/AddLocationRequestTags.dto';
import { DeleteLocationRequestTagDto } from '@/common/dto/business/DeleteLocationRequestTag.dto';
import { GetMyLocationRequestByIdDto } from '@/common/dto/business/GetMyLocationRequestById.dto';

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

  getMyLocationRequestById(
    dto: GetMyLocationRequestByIdDto,
  ): Promise<LocationRequestResponseDto>;

  searchAllLocationRequests(
    query: PaginateQuery,
  ): Promise<Paginated<LocationRequestResponseDto>>;

  getAnyLocationRequestById(
    dto: GetAnyLocationRequestByIdDto,
  ): Promise<LocationRequestResponseDto>;

  processLocationRequest(dto: ProcessLocationRequestDto): Promise<UpdateResult>;
}
