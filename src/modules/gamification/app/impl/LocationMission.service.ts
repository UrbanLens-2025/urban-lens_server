import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ILocationMissionService } from '../ILocationMission.service';
import { LocationMissionRepository } from '@/modules/gamification/infra/repository/LocationMission.repository';
import { CreateLocationMissionDto } from '@/common/dto/gamification/CreateLocationMission.dto';
import { UpdateLocationMissionDto } from '@/common/dto/gamification/UpdateLocationMission.dto';
import {
  BaseService,
  PaginationParams,
  PaginationResult,
} from '@/common/services/base.service';
import { LocationMissionEntity } from '@/modules/gamification/domain/LocationMission.entity';
import { LocationRepository } from '@/modules/business/infra/repository/Location.repository';

@Injectable()
export class LocationMissionService
  extends BaseService<LocationMissionEntity>
  implements ILocationMissionService
{
  constructor(
    private readonly locationMissionRepository: LocationMissionRepository,
    private readonly locationRepository: LocationRepository,
  ) {
    super(locationMissionRepository.repo);
  }

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

      // Validate date range
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
        metric: dto.metric,
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
        metric: savedMission.metric,
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
    params: PaginationParams = {},
  ): Promise<PaginationResult<any>> {
    try {
      const { page, limit, skip } = this.normalizePaginationParams(params);

      const [missions, total] =
        await this.locationMissionRepository.repo.findAndCount({
          where: { locationId },
          order: { createdAt: 'DESC' },
          skip,
          take: limit,
        });

      return {
        data: missions,
        meta: this.buildPaginationMeta(page, limit, total),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private normalizePaginationParams(params: PaginationParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  private buildPaginationMeta(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
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
        metric: updatedMission.metric,
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
        error instanceof NotFoundException
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

      await this.locationMissionRepository.repo.remove(mission);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async getActiveMissionsByLocation(
    locationId: string,
    params: PaginationParams = {},
  ): Promise<PaginationResult<any>> {
    try {
      const { page, limit, skip } = this.normalizePaginationParams(params);
      const now = new Date();

      const [missions, total] = await this.locationMissionRepository.repo
        .createQueryBuilder('mission')
        .where('mission.locationId = :locationId', { locationId })
        .andWhere('mission.startDate <= :now', { now })
        .andWhere('mission.endDate >= :now', { now })
        .orderBy('mission.createdAt', 'DESC')
        .offset(skip)
        .limit(limit)
        .getManyAndCount();

      return {
        data: missions,
        meta: this.buildPaginationMeta(page, limit, total),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
