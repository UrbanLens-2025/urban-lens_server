import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRankDto } from '@/common/dto/gamification/create-rank.dto';
import { UpdateRankDto } from '@/common/dto/gamification/update-rank.dto';
import { RankEntity } from '../../domain/Rank.entity';
import { RankRepository } from '../../infra/repository/Rank.repository';
import { IRankService } from '../IRank.service';
import { LessThanOrEqual, MoreThan } from 'typeorm';

@Injectable()
export class RankService implements IRankService {
  constructor(private readonly rankRepository: RankRepository) {}

  async createRank(dto: CreateRankDto): Promise<string> {
    // Validate minPoints is non-negative
    if (dto.minPoints < 0) {
      throw new BadRequestException('minPoints cannot be negative');
    }

    // Check if rank name already exists
    const existingRank = await this.rankRepository.repo.findOne({
      where: { name: dto.name },
    });

    if (existingRank) {
      throw new BadRequestException(
        `Rank with name ${dto.name} already exists`,
      );
    }

    // Check if point range overlaps with any existing rank
    await this.validatePointRange(dto.minPoints, dto.maxPoints);

    const rank = this.rankRepository.repo.create(dto);
    const savedRank = await this.rankRepository.repo.save(rank);
    return savedRank.id;
  }

  /**
   * Validate that the point range doesn't overlap with existing ranks
   * Two ranges overlap if they have any points in common
   */
  private async validatePointRange(
    minPoints: number,
    maxPoints: number,
    excludeId?: string,
  ): Promise<void> {
    // Validate that minPoints < maxPoints
    if (minPoints >= maxPoints) {
      throw new BadRequestException('minPoints must be less than maxPoints');
    }

    // Get all existing ranks
    const allRanks = await this.rankRepository.repo.find();

    // Filter out the rank being updated (if any)
    const ranksToCheck = excludeId
      ? allRanks.filter((r) => r.id !== excludeId)
      : allRanks;

    for (const existingRank of ranksToCheck) {
      const existingMin = existingRank.minPoints;
      const existingMax = existingRank.maxPoints;

      // Two ranges [a1, b1] and [a2, b2] overlap if:
      // NOT (b1 < a2 OR b2 < a1)
      // Which is equivalent to: b1 >= a2 AND b2 >= a1

      // For our case:
      // New range: [minPoints, maxPoints]
      // Existing range: [existingMin, existingMax]

      // Ranges don't overlap if:
      // 1. maxPoints < existingMin (new range ends before existing starts)
      // 2. minPoints > existingMax (new range starts after existing ends, only if existingMax is not null)

      const newRangeEndsBeforeExisting = maxPoints < existingMin;
      const newRangeStartsAfterExisting =
        existingMax !== null && minPoints > existingMax;

      const rangesOverlap =
        !newRangeEndsBeforeExisting && !newRangeStartsAfterExisting;

      if (rangesOverlap) {
        throw new BadRequestException(
          `Point range conflict: Range [${minPoints}-${maxPoints}] overlaps with existing rank "${existingRank.name}" [${existingMin}-${existingMax || '∞'}]`,
        );
      }
    }
  }

  async getRanks(): Promise<RankEntity[]> {
    return await this.rankRepository.repo.find({
      order: { minPoints: 'ASC' },
    });
  }

  async getRankById(id: string): Promise<RankEntity> {
    const rank = await this.rankRepository.repo.findOne({
      where: { id },
    });

    if (!rank) {
      throw new NotFoundException('Rank not found');
    }

    return rank;
  }

  async getRankByPoints(points: number): Promise<RankEntity | null> {
    // Validate points is non-negative
    if (points < 0) {
      throw new BadRequestException('Points cannot be negative');
    }

    // Find rank where points >= minPoints AND (maxPoints is null OR points <= maxPoints)
    const rank = await this.rankRepository.repo
      .createQueryBuilder('rank')
      .where('rank.min_points <= :points', { points })
      .andWhere('(rank.max_points IS NULL OR rank.max_points >= :points)', {
        points,
      })
      .orderBy('rank.min_points', 'DESC')
      .getOne();

    return rank;
  }

  async getLowestRank(): Promise<RankEntity> {
    const lowestRank = await this.rankRepository.repo.findOne({
      order: { minPoints: 'ASC' },
    });

    if (!lowestRank) {
      throw new NotFoundException(
        'No ranks found in system. Please create ranks first.',
      );
    }

    return lowestRank;
  }

  //   async updateRank(id: string, dto: UpdateRankDto): Promise<string> {
  //     const rank = await this.getRankById(id);

  //     // If updating level, check if new level already exists
  //     const existingRank = await this.rankRepository.repo.findOne({
  //       where: { name: rank.name },
  //     });

  //     Object.assign(rank, dto);
  //     await this.rankRepository.repo.save(rank);
  //     return rank.id;
  //   }

  async deleteRank(id: string): Promise<void> {
    const rank = await this.getRankById(id);
    await this.rankRepository.repo.remove(rank);
  }
}
