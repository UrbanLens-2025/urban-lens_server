import { CreateLocationMissionDto } from '@/common/dto/gamification/CreateLocationMission.dto';
import { UpdateLocationMissionDto } from '@/common/dto/gamification/UpdateLocationMission.dto';
import {
  PaginationParams,
  PaginationResult,
} from '@/common/services/base.service';

export const ILocationMissionService = Symbol('ILocationMissionService');

export interface ILocationMissionService {
  createMission(
    locationId: string,
    dto: CreateLocationMissionDto,
  ): Promise<any>;

  getMissionsByLocation(
    locationId: string,
    params?: PaginationParams,
  ): Promise<PaginationResult<any>>;

  getMissionById(missionId: string): Promise<any>;

  updateMission(missionId: string, dto: UpdateLocationMissionDto): Promise<any>;

  deleteMission(missionId: string): Promise<void>;

  getActiveMissionsByLocation(
    locationId: string,
    params?: PaginationParams,
  ): Promise<PaginationResult<any>>;
}
