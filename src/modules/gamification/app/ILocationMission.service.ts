import { CreateLocationMissionDto } from '@/common/dto/gamification/CreateLocationMission.dto';
import { UpdateLocationMissionDto } from '@/common/dto/gamification/UpdateLocationMission.dto';
import { Paginated, PaginateQuery } from 'nestjs-paginate';
import { LocationMissionResponseDto } from '@/common/dto/gamification/LocationMission.response.dto';

export const ILocationMissionService = Symbol('ILocationMissionService');

export interface ILocationMissionService {
  createMission(
    locationId: string,
    dto: CreateLocationMissionDto,
  ): Promise<LocationMissionResponseDto>;

  getMissionsByLocation(
    locationId: string,
    query: PaginateQuery,
  ): Promise<Paginated<LocationMissionResponseDto>>;

  getMissionById(missionId: string): Promise<LocationMissionResponseDto>;

  updateMission(
    missionId: string,
    dto: UpdateLocationMissionDto,
  ): Promise<LocationMissionResponseDto>;

  deleteMission(missionId: string): Promise<void>;

  getActiveMissionsByLocation(
    locationId: string,
    query: PaginateQuery,
  ): Promise<Paginated<LocationMissionResponseDto>>;

  getAvailableMissionsForUser(
    locationId: string,
    userProfileId: string,
    query: PaginateQuery,
  ): Promise<Paginated<LocationMissionResponseDto>>;

  getCompletedMissionsByUser(
    locationId: string,
    userProfileId: string,
    query: PaginateQuery,
  ): Promise<Paginated<LocationMissionResponseDto>>;
}
