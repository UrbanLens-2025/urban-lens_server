import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserLocationProfileEntity } from '../../domain/UserLocationProfile.entity';

@Injectable()
export class UserLocationProfileRepository {
  public readonly repo: Repository<UserLocationProfileEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(UserLocationProfileEntity);
  }

  async findByUserAndLocation(
    userProfileId: string,
    locationId: string,
  ): Promise<UserLocationProfileEntity | null> {
    return this.repo.findOne({
      where: {
        userProfileId,
        locationId,
      },
    });
  }

  async findByUser(
    userProfileId: string,
  ): Promise<UserLocationProfileEntity[]> {
    return this.repo.find({
      where: { userProfileId },
      order: { totalPoints: 'DESC' },
    });
  }

  async findByLocation(
    locationId: string,
  ): Promise<UserLocationProfileEntity[]> {
    return this.repo.find({
      where: { locationId },
      order: { totalPoints: 'DESC' },
    });
  }

  async createOrUpdate(
    userProfileId: string,
    locationId: string,
    pointsToAdd: number,
  ): Promise<UserLocationProfileEntity> {
    let profile = await this.findByUserAndLocation(userProfileId, locationId);

    if (!profile) {
      profile = this.repo.create({
        userProfileId,
        locationId,
        totalPoints: pointsToAdd,
        availablePoints: pointsToAdd,
      });
    } else {
      profile.totalPoints += pointsToAdd;
      profile.availablePoints += pointsToAdd;
    }

    return this.repo.save(profile);
  }

  async updateAvailablePoints(
    userProfileId: string,
    locationId: string,
    pointsToDeduct: number,
  ): Promise<UserLocationProfileEntity | null> {
    const profile = await this.findByUserAndLocation(userProfileId, locationId);

    if (!profile) {
      return null;
    }

    if (profile.availablePoints < pointsToDeduct) {
      throw new Error('Insufficient available points');
    }

    profile.availablePoints -= pointsToDeduct;
    return this.repo.save(profile);
  }

  async getLocationLeaderboard(
    locationId: string,
    limit: number = 10,
  ): Promise<UserLocationProfileEntity[]> {
    return this.repo.find({
      where: { locationId },
      order: { totalPoints: 'DESC' },
      take: limit,
    });
  }
}
