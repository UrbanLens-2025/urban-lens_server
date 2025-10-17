import { CreateLocationRequestDto } from '@/common/dto/business/CreateLocationRequest.dto';
import { LocationRequestResponseDto } from '@/common/dto/business/res/LocationRequest.response.dto';
import { UpdateResult } from 'typeorm';
import { UpdateLocationRequestDto } from '@/common/dto/business/UpdateLocationRequest.dto';
import { CancelLocationRequestDto } from '@/common/dto/business/CancelLocationRequest.dto';
import { Paginated, PaginateQuery } from 'nestjs-paginate';
import { GetLocationRequestToProcessByIdDto } from '@/common/dto/business/GetLocationRequestToProcessById.dto';
import { ProcessLocationRequestDto } from '@/common/dto/business/ProcessLocationRequest.dto';

export const ILocationRequestManagementService = Symbol(
  'ILocationRequestManagementService',
);
export interface ILocationRequestManagementService {
  createLocationRequest(
    dto: CreateLocationRequestDto,
  ): Promise<LocationRequestResponseDto>;

  updateLocationRequest(dto: UpdateLocationRequestDto): Promise<UpdateResult>;

  cancelLocationRequest(dto: CancelLocationRequestDto): Promise<UpdateResult>;

  getLocationRequestsToProcess(
    query: PaginateQuery,
  ): Promise<Paginated<LocationRequestResponseDto>>;

  getLocationRequestToProcessById(
    dto: GetLocationRequestToProcessByIdDto,
  ): Promise<LocationRequestResponseDto>;

  processLocationRequest(dto: ProcessLocationRequestDto): Promise<UpdateResult>;
}
