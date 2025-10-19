import { UpdateLocationDto } from '@/common/dto/business/UpdateLocation.dto';
import { UpdateResult } from 'typeorm';

export const ILocationManagementService = Symbol('ILocationManagementService');
export interface ILocationManagementService {
  updateLocation(dto: UpdateLocationDto): Promise<UpdateResult>;
}
