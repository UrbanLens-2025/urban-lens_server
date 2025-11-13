import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ILocationMissionService } from '../ILocationMission.service';
import { LocationMissionRepository } from '@/modules/gamification/infra/repository/LocationMission.repository';
import { CreateLocationMissionDto } from '@/common/dto/gamification/CreateLocationMission.dto';
import { UpdateLocationMissionDto } from '@/common/dto/gamification/UpdateLocationMission.dto';
import { LocationMissionEntity } from '@/modules/gamification/domain/LocationMission.entity';
import { LocationRepository } from '@/modules/business/infra/repository/Location.repository';
import { UserMissionProgressRepository } from '@/modules/gamification/infra/repository/UserMissionProgress.repository';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class LocationMissionService implements ILocationMissionService {
  constructor(
    private readonly locationMissionRepository: LocationMissionRepository,
    private readonly locationRepository: LocationRepository,
    private readonly userMissionProgressRepository: UserMissionProgressRepository,
  ) {}

  async createMission(
    locationId: string,
    dto: CreateLocationMissionDto,
  ): Promise<any> {
    try {
      // Verify location exists
      const location = await this.locationRepository.repo.findOne({
        where: { id: locationId },
      });

      if (!location) {
        throw new NotFoundException('Location not found');
      }

      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);
      const now = new Date();

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      if (endDate <= now) {
        throw new BadRequestException('End date must be in the future');
      }

      // Create mission
      const mission = this.locationMissionRepository.repo.create({
        locationId,
        title: dto.title,
        description: dto.description,
        target: dto.target,
        reward: dto.reward,
        startDate,
        endDate,
        imageUrls: dto.imageUrls || [],
      });

      const savedMission =
        await this.locationMissionRepository.repo.save(mission);

      return {
        id: savedMission.id,
        locationId: savedMission.locationId,
        title: savedMission.title,
        description: savedMission.description,
        target: savedMission.target,
        reward: savedMission.reward,
        startDate: savedMission.startDate,
        endDate: savedMission.endDate,
        imageUrls: savedMission.imageUrls,
        createdAt: savedMission.createdAt,
        updatedAt: savedMission.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async getMissionsByLocation(
    locationId: string,
    query: PaginateQuery,
  ): Promise<Paginated<any>> {
    try {
      return paginate(query, this.locationMissionRepository.repo, {
        where: { locationId },
        sortableColumns: ['createdAt'],
        defaultSortBy: [['createdAt', 'DESC']],
        searchableColumns: ['title'],
        filterableColumns: {
          title: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getMissionById(missionId: string): Promise<any> {
    try {
      const mission = await this.locationMissionRepository.repo.findOne({
        where: { id: missionId },
        relations: ['location'],
      });

      if (!mission) {
        throw new NotFoundException('Mission not found');
      }

      return mission;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async updateMission(
    missionId: string,
    dto: UpdateLocationMissionDto,
  ): Promise<any> {
    try {
      const mission = await this.locationMissionRepository.repo.findOne({
        where: { id: missionId },
      });

      if (!mission) {
        throw new NotFoundException('Mission not found');
      }

      // Check if any users have participated in this mission
      const participantCount =
        await this.userMissionProgressRepository.repo.count({
          where: { missionId },
        });

      if (participantCount > 0) {
        throw new ForbiddenException(
          'Cannot update mission - users have already participated',
        );
      }

      // Validate date range if provided
      if (dto.startDate || dto.endDate) {
        const startDate = dto.startDate
          ? new Date(dto.startDate)
          : mission.startDate;
        const endDate = dto.endDate ? new Date(dto.endDate) : mission.endDate;

        if (startDate >= endDate) {
          throw new BadRequestException('Start date must be before end date');
        }
      }

      // Update mission
      Object.assign(mission, dto);
      const updatedMission =
        await this.locationMissionRepository.repo.save(mission);

      return {
        id: updatedMission.id,
        locationId: updatedMission.locationId,
        title: updatedMission.title,
        description: updatedMission.description,
        target: updatedMission.target,
        reward: updatedMission.reward,
        startDate: updatedMission.startDate,
        endDate: updatedMission.endDate,
        imageUrls: updatedMission.imageUrls,
        createdAt: updatedMission.createdAt,
        updatedAt: updatedMission.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async deleteMission(missionId: string): Promise<void> {
    try {
      const mission = await this.locationMissionRepository.repo.findOne({
        where: { id: missionId },
      });

      if (!mission) {
        throw new NotFoundException('Mission not found');
      }

      // Check if any users have participated in this mission
      const participantCount =
        await this.userMissionProgressRepository.repo.count({
          where: { missionId },
        });

      if (participantCount > 0) {
        throw new ForbiddenException(
          'Cannot delete mission - users have already participated',
        );
      }

      await this.locationMissionRepository.repo.remove(mission);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async getActiveMissionsByLocation(
    locationId: string,
    query: PaginateQuery,
  ): Promise<Paginated<any>> {
    try {
      const now = new Date();
      const queryBuilder = this.locationMissionRepository.repo
        .createQueryBuilder('mission')
        .where('mission.locationId = :locationId', { locationId })
        .andWhere('mission.startDate <= :now', { now })
        .andWhere('mission.endDate >= :now', { now });

      return paginate(query, queryBuilder, {
        sortableColumns: ['createdAt'],
        defaultSortBy: [['createdAt', 'DESC']],
        searchableColumns: ['title'],
        filterableColumns: {
          title: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAvailableMissionsForUser(
    locationId: string,
    userProfileId: string,
    query: PaginateQuery,
  ): Promise<Paginated<any>> {
    try {
      const now = new Date();

      // Get all active missions at this location
      const activeMissions = await this.locationMissionRepository.repo
        .createQueryBuilder('mission')
        .where('mission.locationId = :locationId', { locationId })
        .andWhere('mission.startDate <= :now', { now })
        .andWhere('mission.endDate >= :now', { now })
        .getMany();

      // Get user's mission progress (all missions)
      const userProgress = await this.userMissionProgressRepository.repo.find({
        where: {
          userProfileId,
        },
      });

      // Create progress map
      const progressMap = new Map<
        string,
        { progress: number; completed: boolean }
      >();
      userProgress.forEach((p) => {
        progressMap.set(p.missionId, {
          progress: p.progress,
          completed: p.completed,
        });
      });

      // Filter out completed missions and add progress data
      const availableMissions = activeMissions
        .filter((m) => {
          const prog = progressMap.get(m.id);
          return !prog || !prog.completed; // Include if no progress or not completed
        })
        .map((m) => {
          const prog = progressMap.get(m.id);
          return {
            ...m,
            currentProgress: prog?.progress || 0,
            isStarted: !!prog,
          };
        });

      if (availableMissions.length === 0) {
        // Return empty paginated result
        return {
          data: [],
          meta: {
            itemsPerPage: query.limit || 10,
            totalItems: 0,
            currentPage: query.page || 1,
            totalPages: 0,
            sortBy: [],
            searchBy: [],
            search: '',
            select: [],
            filter: {},
          },
          links: {
            first: '',
            previous: '',
            current: '',
            next: '',
            last: '',
          },
        };
      }

      // Manual pagination since we already have enriched data
      const page = query.page || 1;
      const limit = query.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedData = availableMissions.slice(startIndex, endIndex);
      const totalItems = availableMissions.length;
      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: paginatedData,
        meta: {
          itemsPerPage: limit,
          totalItems,
          currentPage: page,
          totalPages,
          sortBy: [],
          searchBy: [],
          search: '',
          select: [],
          filter: {},
        },
        links: {
          first: '',
          previous: '',
          current: '',
          next: '',
          last: '',
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getCompletedMissionsByUser(
    locationId: string,
    userProfileId: string,
    query: PaginateQuery,
  ): Promise<Paginated<any>> {
    try {
      // Get user's completed missions at this location
      const completedProgress = await this.userMissionProgressRepository.repo
        .createQueryBuilder('progress')
        .leftJoinAndSelect('progress.mission', 'mission')
        .where('progress.userProfileId = :userProfileId', { userProfileId })
        .andWhere('progress.completed = :completed', { completed: true })
        .andWhere('mission.locationId = :locationId', { locationId })
        .getMany();

      if (completedProgress.length === 0) {
        // Return empty paginated result
        return {
          data: [],
          meta: {
            itemsPerPage: query.limit || 10,
            totalItems: 0,
            currentPage: query.page || 1,
            totalPages: 0,
            sortBy: [],
            searchBy: [],
            search: '',
            select: [],
            filter: {},
          },
          links: {
            first: '',
            previous: '',
            current: '',
            next: '',
            last: '',
          },
        };
      }

      // Add progress data to missions
      const completedMissions = completedProgress.map((p) => ({
        ...p.mission,
        currentProgress: p.progress,
        isCompleted: true,
      }));

      // Manual pagination
      const page = query.page || 1;
      const limit = query.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedData = completedMissions.slice(startIndex, endIndex);
      const totalItems = completedMissions.length;
      const totalPages = Math.ceil(totalItems / limit);

      return {
        data: paginatedData,
        meta: {
          itemsPerPage: limit,
          totalItems,
          currentPage: page,
          totalPages,
          sortBy: [],
          searchBy: [],
          search: '',
          select: [],
          filter: {},
        },
        links: {
          first: '',
          previous: '',
          current: '',
          next: '',
          last: '',
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
