import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCheckInDto } from '@/common/dto/checkin/CreateCheckIn.dto';
import { GetCheckInsQueryDto } from '@/common/dto/checkin/GetCheckInsQuery.dto';
import { CheckInEntity } from '../../domain/CheckIn.entity';
import { ICheckInService } from '../ICheckIn.service';
import { CheckInRepository } from '../../infra/repository/CheckIn.repository';
import { LocationRepository } from '../../infra/repository/Location.repository';
import { UserProfileRepository } from '@/modules/account/infra/repository/UserProfile.repository';
import { PaginationResult } from '@/common/services/base.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CHECK_IN_CREATED_EVENT,
  CheckInCreatedEvent,
} from '@/modules/gamification/domain/events/CheckInCreated.event';

@Injectable()
export class CheckInService implements ICheckInService {
  constructor(
    private readonly checkInRepository: CheckInRepository,
    private readonly locationRepository: LocationRepository,
    private readonly profileRepository: UserProfileRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createCheckIn(
    profileId: string,
    createCheckInDto: CreateCheckInDto,
  ): Promise<CheckInEntity> {
    const profile = await this.profileRepository.repo.findOne({
      where: { accountId: profileId },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const location = await this.locationRepository.repo.findOne({
      where: {
        id: createCheckInDto.locationId,
      },
      relations: ['business'],
    });
    if (!location) {
      throw new NotFoundException('Location not found or not approved');
    }

    const hasCheckIn = await this.checkHasCheckIn(
      profileId,
      createCheckInDto.locationId,
    );

    if (hasCheckIn) {
      throw new BadRequestException(
        'You already have a check-in at this location.',
      );
    }

    const checkIn = this.checkInRepository.repo.create({
      userProfileId: profileId,
      locationId: createCheckInDto.locationId,
      notes: createCheckInDto.notes,
      checkInTime: new Date(),
    });

    const savedCheckIn = await this.checkInRepository.repo.save(checkIn);

    // Emit check-in created event for gamification
    const checkInCreatedEvent = new CheckInCreatedEvent();
    checkInCreatedEvent.checkInId = savedCheckIn.id;
    checkInCreatedEvent.userId = profileId;
    checkInCreatedEvent.locationId = createCheckInDto.locationId;
    this.eventEmitter.emit(CHECK_IN_CREATED_EVENT, checkInCreatedEvent);

    return savedCheckIn;
  }

  async getCheckInsByProfileId(
    profileId: string,
    queryDto: GetCheckInsQueryDto,
  ): Promise<PaginationResult<CheckInEntity>> {
    const { page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;
    const [checkIns, totalItems] =
      await this.checkInRepository.repo.findAndCount({
        where: { userProfileId: profileId },
        skip,
        take: limit,
        relations: ['location'],
        order: {
          checkInTime: 'DESC',
        },
      });
    return {
      data: checkIns,
      meta: {
        totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        hasNextPage: page < Math.ceil(totalItems / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  private async checkHasCheckIn(
    profileId: string,
    locationId: string,
  ): Promise<CheckInEntity | null> {
    return this.checkInRepository.repo.findOne({
      where: { userProfileId: profileId, locationId },
    });
  }
}
