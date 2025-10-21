import { CoreService } from '@/common/core/Core.service';
import { CheckInResponseDto } from '@/common/dto/business/res/CheckIn.response.dto';
import { RegisterCheckInDto } from '@/common/dto/RegisterCheckIn.dto';
import { ICheckInV2Service } from '@/modules/business/app/ICheckInV2.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CheckInRepositoryProvider } from '@/modules/business/infra/repository/CheckIn.repository';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { CheckInEntity } from '@/modules/business/domain/CheckIn.entity';
import {
  CHECK_IN_CREATED_EVENT,
  CheckInCreatedEvent,
} from '@/modules/gamification/domain/events/CheckInCreated.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GetMyCheckInsDto } from '@/common/dto/business/GetMyCheckIns.dto';
import { paginate, Paginated } from 'nestjs-paginate';
import { GetMyCheckInByLocationIdDto } from '@/common/dto/business/GetMyCheckInByLocationId.dto';

@Injectable()
export class CheckInV2Service extends CoreService implements ICheckInV2Service {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  registerCheckIn(dto: RegisterCheckInDto): Promise<CheckInResponseDto> {
    return this.ensureTransaction(null, async (manager) => {
      const locationRepository = LocationRepositoryProvider(manager);
      const checkInRepository = CheckInRepositoryProvider(manager);

      const location = await locationRepository.findOneByOrFail({
        id: dto.locationId,
      });

      if (!location.canBeViewedOnMap()) {
        throw new NotFoundException('Location not found');
      }

      // Check if user has already checked-in here
      const existingCheckIn = await checkInRepository.exists({
        where: {
          locationId: dto.locationId,
          userProfileId: dto.accountId,
        },
      });
      if (existingCheckIn) {
        throw new BadRequestException(
          'You have already checked in at this location',
        );
      }

      // Check if sent coordinates are within acceptable range for the location
      const distanceToLocation = await locationRepository.calculateDistanceTo({
        locationId: dto.locationId,
        dest: {
          latitude: dto.currentLatitude,
          longitude: dto.currentLongitude,
        },
      });

      if (
        (distanceToLocation === undefined
          ? Number.MAX_SAFE_INTEGER
          : distanceToLocation) > location.radiusMeters
      ) {
        throw new BadRequestException(
          `You are not in the acceptable check-in range of the location. Current distance to location: ${distanceToLocation}. Location Radus: ${location.radiusMeters}`,
        );
      }

      // create check-in entity
      const checkInEntity = new CheckInEntity();
      checkInEntity.userProfileId = dto.accountId;
      checkInEntity.locationId = dto.locationId;
      checkInEntity.latitudeAtCheckIn = dto.currentLatitude;
      checkInEntity.longitudeAtCheckIn = dto.currentLongitude;

      return (
        checkInRepository
          .save(checkInEntity)
          // Emit events
          .then((e) => {
            const checkInCreatedEvent = new CheckInCreatedEvent();
            checkInCreatedEvent.checkInId = e.id;
            checkInCreatedEvent.userId = e.userProfileId;
            checkInCreatedEvent.locationId = e.locationId;
            this.eventEmitter.emit(CHECK_IN_CREATED_EVENT, checkInCreatedEvent);

            return e;
          })
          .then((e) => this.mapTo(CheckInResponseDto, e))
      );
    });
  }

  getMyCheckIns(dto: GetMyCheckInsDto): Promise<Paginated<CheckInResponseDto>> {
    const checkInRepository = CheckInRepositoryProvider(this.dataSource);
    return paginate(dto.query, checkInRepository, {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      where: {
        userProfileId: dto.accountId,
      },
      relations: {
        location: true,
      },
    }).then((res) => this.mapToPaginated(CheckInResponseDto, res));
  }

  getMyCheckInByLocationId(
    dto: GetMyCheckInByLocationIdDto,
  ): Promise<CheckInResponseDto> {
    const checkInRepository = CheckInRepositoryProvider(this.dataSource);
    return checkInRepository
      .findOne({
        where: {
          locationId: dto.locationId,
          userProfileId: dto.accountId,
        },
      })
      .then((e) => this.mapTo(CheckInResponseDto, e));
  }
}
