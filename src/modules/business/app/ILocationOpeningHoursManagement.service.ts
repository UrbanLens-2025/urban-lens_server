import { CreateLocationOpeningHoursDto } from '@/common/dto/business/CreateLocationOpeningHours.dto';
import { UpdateLocationOpeningHoursDto } from '@/common/dto/business/UpdateLocationOpeningHours.dto';
import { DeleteLocationOpeningHoursDto } from '@/common/dto/business/DeleteLocationOpeningHours.dto';
import { GetLocationOpeningHoursDto } from '@/common/dto/business/GetLocationOpeningHours.dto';
import { LocationOpeningHoursResponseDto } from '@/common/dto/business/res/LocationOpeningHours.response.dto';
import { UpdateResult } from 'typeorm';

export const ILocationOpeningHoursManagementService = Symbol(
  'ILocationOpeningHoursManagementService',
);

export interface ILocationOpeningHoursManagementService {
  createLocationOpeningHours(
    dto: CreateLocationOpeningHoursDto,
  ): Promise<LocationOpeningHoursResponseDto>;

  updateLocationOpeningHours(
    dto: UpdateLocationOpeningHoursDto,
  ): Promise<UpdateResult>;

  deleteLocationOpeningHours(
    dto: DeleteLocationOpeningHoursDto,
  ): Promise<LocationOpeningHoursResponseDto>;

  getLocationOpeningHours(
    dto: GetLocationOpeningHoursDto,
  ): Promise<LocationOpeningHoursResponseDto[]>;
}

