import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateCheckInDto } from '@/common/dto/checkin/CreateCheckIn.dto';
import { GetCheckInsQueryDto } from '@/common/dto/checkin/GetCheckInsQuery.dto';
import { CheckInEntity } from '../../domain/CheckIn.entity';
import { ICheckInService } from '../ICheckIn.service';
import { CheckInRepository } from '../../infra/repository/CheckIn.repository';
import { LocationRepository } from '../../infra/repository/Location.repository';
import { UserProfileRepository } from '@/modules/account/infra/repository/UserProfile.repository';
import { LocationRequestStatus } from '@/common/constants/Location.constant';

@Injectable()
export class CheckInService implements ICheckInService {
  constructor(
    private readonly checkInRepository: CheckInRepository,
    private readonly locationRepository: LocationRepository,
    private readonly profileRepository: UserProfileRepository,
  ) {}

  async createCheckIn(
    profileId: string,
    createCheckInDto: CreateCheckInDto,
  ): Promise<CheckInEntity> {
    // Verify profile exists
    const profile = await this.profileRepository.repo.findOne({
      where: { accountId: profileId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Verify location exists and is approved
    const location = await this.locationRepository.repo.findOne({
      where: {
        id: createCheckInDto.locationId,
        status: LocationRequestStatus.APPROVED,
      },
      relations: ['business'],
    });
    if (!location) {
      throw new NotFoundException('Location not found or not approved');
    }

    // Check if user already has an active check-in
    const activeCheckIn = await this.getActiveCheckIn(profileId);
    if (activeCheckIn) {
      throw new BadRequestException(
        'You already have an active check-in. Please check out first.',
      );
    }

    // Create new check-in
    const checkIn = this.checkInRepository.repo.create({
      profileId,
      locationId: createCheckInDto.locationId,
      notes: createCheckInDto.notes,
      checkInTime: new Date(),
    });

    return await this.checkInRepository.repo.save(checkIn);
  }

  async getCheckInsWithFilters(queryDto: GetCheckInsQueryDto): Promise<{
    data: CheckInEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, locationId, profileId, isActive } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.checkInRepository.repo
      .createQueryBuilder('checkIn')
      .leftJoinAndSelect('checkIn.profile', 'profile')
      .leftJoinAndSelect('checkIn.location', 'location')
      .leftJoinAndSelect('location.business', 'business');

    // Apply filters
    if (locationId) {
      queryBuilder.andWhere('checkIn.locationId = :locationId', { locationId });
    }

    if (profileId) {
      queryBuilder.andWhere('checkIn.profileId = :profileId', { profileId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('checkIn.isActive = :isActive', { isActive });
    }

    // Order by check-in time (newest first)
    queryBuilder.orderBy('checkIn.checkInTime', 'DESC');

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getCheckInsByProfileId(
    profileId: string,
    queryDto: GetCheckInsQueryDto,
  ): Promise<{
    data: CheckInEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getCheckInsWithFilters({
      ...queryDto,
      profileId,
    });
  }

  async getCheckInsByLocationId(
    locationId: string,
    queryDto: GetCheckInsQueryDto,
  ): Promise<{
    data: CheckInEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getCheckInsWithFilters({
      ...queryDto,
      locationId,
    });
  }

  async getActiveCheckIn(profileId: string): Promise<CheckInEntity | null> {
    return await this.checkInRepository.repo.findOne({
      where: {
        profileId,
      },
      relations: ['location', 'location.business'],
    });
  }

  async checkOut(checkInId: string, profileId: string): Promise<CheckInEntity> {
    const checkIn = await this.checkInRepository.repo.findOne({
      where: { id: checkInId },
      relations: ['location'],
    });

    if (!checkIn) {
      throw new NotFoundException('Check-in not found');
    }

    if (checkIn.profileId !== profileId) {
      throw new ForbiddenException('You can only check out your own check-ins');
    }

    return await this.checkInRepository.repo.save(checkIn);
  }

  async getCheckInById(checkInId: string): Promise<CheckInEntity> {
    const checkIn = await this.checkInRepository.repo.findOne({
      where: { id: checkInId },
      relations: ['profile', 'location', 'location.business'],
    });

    if (!checkIn) {
      throw new NotFoundException('Check-in not found');
    }

    return checkIn;
  }

  async deleteCheckIn(checkInId: string, profileId: string): Promise<void> {
    const checkIn = await this.checkInRepository.repo.findOne({
      where: { id: checkInId },
    });

    if (!checkIn) {
      throw new NotFoundException('Check-in not found');
    }

    if (checkIn.profileId !== profileId) {
      throw new ForbiddenException('You can only delete your own check-ins');
    }

    await this.checkInRepository.repo.remove(checkIn);
  }
}
