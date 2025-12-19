import { CreateLocationMissionDto } from '@/common/dto/gamification/CreateLocationMission.dto';
import { UpdateLocationMissionDto } from '@/common/dto/gamification/UpdateLocationMission.dto';
import { Paginated, PaginateQuery, PaginateConfig } from 'nestjs-paginate';
import { LocationMissionResponseDto } from '@/common/dto/gamification/LocationMission.response.dto';
import { LocationMissionEntity } from '@/modules/gamification/domain/LocationMission.entity';

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

  getAllMissionsUnfiltered(
    query: PaginateQuery,
  ): Promise<Paginated<LocationMissionResponseDto>>;
}

export namespace ILocationMissionService_QueryConfig {
  export function getAllMissionsUnfiltered(): PaginateConfig<LocationMissionEntity> {
    return {
      sortableColumns: ['createdAt', 'startDate', 'endDate'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['title'],
      filterableColumns: {
        locationId: true,
        title: true,
      },
      relations: {
        location: true,
      },
    };
  }
}
