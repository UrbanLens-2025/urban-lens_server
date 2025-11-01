import { CreateLocationMissionDto } from '@/common/dto/gamification/CreateLocationMission.dto';
import { UpdateLocationMissionDto } from '@/common/dto/gamification/UpdateLocationMission.dto';
import { Paginated, PaginateQuery } from 'nestjs-paginate';

export const ILocationMissionService = Symbol('ILocationMissionService');

export interface ILocationMissionService {
  createMission(
    locationId: string,
    dto: CreateLocationMissionDto,
  ): Promise<any>;

  getMissionsByLocation(
    locationId: string,
    query: PaginateQuery,
  ): Promise<Paginated<any>>;

  getMissionById(missionId: string): Promise<any>;

  updateMission(missionId: string, dto: UpdateLocationMissionDto): Promise<any>;

  deleteMission(missionId: string): Promise<void>;

  getActiveMissionsByLocation(
    locationId: string,
    query: PaginateQuery,
  ): Promise<Paginated<any>>;

  getAvailableMissionsForUser(
    locationId: string,
    userProfileId: string,
    query: PaginateQuery,
  ): Promise<Paginated<any>>;

  getCompletedMissionsByUser(
    locationId: string,
    userProfileId: string,
    query: PaginateQuery,
  ): Promise<Paginated<any>>;
}
