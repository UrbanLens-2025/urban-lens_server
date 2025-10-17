import { CoreService } from '@/common/core/Core.service';
import { CreateLocationRequestDto } from '@/common/dto/business/CreateLocationRequest.dto';
import { ILocationRequestManagementService } from '@/modules/business/app/ILocationRequestManagement.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { LocationRequestResponseDto } from '@/common/dto/business/res/LocationRequest.response.dto';
import { LocationRequestRepository } from '@/modules/business/infra/repository/LocationRequest.repository';
import { BusinessRepositoryProvider } from '@/modules/account/infra/repository/Business.repository';
import { LocationRequestEntity } from '@/modules/business/domain/LocationRequest.entity';
import { LocationRequestStatus } from '@/common/constants/Location.constant';
import { UpdateResult } from 'typeorm';
import { UpdateLocationRequestDto } from '@/common/dto/business/UpdateLocationRequest.dto';
import { CancelLocationRequestDto } from '@/common/dto/business/CancelLocationRequest.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { GetLocationRequestToProcessByIdDto } from '@/common/dto/business/GetLocationRequestToProcessById.dto';
import { ProcessLocationRequestDto } from '@/common/dto/business/ProcessLocationRequest.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  LOCATION_REQUEST_APPROVED_EVENT,
  LocationRequestApprovedEvent,
} from '@/modules/business/domain/events/LocationRequestApproved.event';

@Injectable()
export class LocationRequestManagementService
  extends CoreService
  implements ILocationRequestManagementService
{
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  createLocationRequest(
    dto: CreateLocationRequestDto,
  ): Promise<LocationRequestResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const locationRequestRepository = LocationRequestRepository(em);
      const businessProfileRepository = BusinessRepositoryProvider(em);

      const businessProfile = await businessProfileRepository.findOneByOrFail({
        accountId: dto.createdById,
      });

      if (!businessProfile.canCreateLocation()) {
        throw new BadRequestException(
          'This business is not allowed to create a location',
        );
      }

      const locationRequest = this.mapTo_Raw(LocationRequestEntity, dto);
      // TODO add automatic location validation process here
      locationRequest.status = LocationRequestStatus.AWAITING_ADMIN_REVIEW;

      return locationRequestRepository
        .save(locationRequest)
        .then((e) => this.mapTo(LocationRequestResponseDto, e));
    });
  }

  updateLocationRequest(dto: UpdateLocationRequestDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const locationRequestRepository = LocationRequestRepository(em);

      const locationRequest = await locationRequestRepository.findOneByOrFail({
        id: dto.locationRequestId,
        createdById: dto.accountId,
      });

      if (!locationRequest.canBeUpdated()) {
        throw new BadRequestException(
          'This location request cannot be updated',
        );
      }

      const updatedLocationRequest = this.mapTo_safe(
        LocationRequestEntity,
        dto,
      );

      return locationRequestRepository.update(
        { id: locationRequest.id },
        updatedLocationRequest,
      );
    });
  }

  cancelLocationRequest(dto: CancelLocationRequestDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const locationRequestRepository = LocationRequestRepository(em);

      const locationRequest = await locationRequestRepository.findOneByOrFail({
        id: dto.locationRequestId,
        createdById: dto.accountId,
      });

      if (!locationRequest.canBeUpdated()) {
        throw new BadRequestException(
          'This location request cannot be cancelled',
        );
      }

      locationRequest.status = LocationRequestStatus.CANCELLED_BY_BUSINESS;

      return locationRequestRepository.update(
        { id: dto.locationRequestId },
        locationRequest,
      );
    });
  }

  getLocationRequestsToProcess(
    query: PaginateQuery,
  ): Promise<Paginated<LocationRequestResponseDto>> {
    return paginate(query, LocationRequestRepository(this.dataSource), {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      where: {
        status: LocationRequestStatus.AWAITING_ADMIN_REVIEW,
      },
    }).then(
      (res) =>
        ({
          ...res,
          data: res.data.map((i) => this.mapTo(LocationRequestResponseDto, i)),
        }) as Paginated<LocationRequestResponseDto>,
    );
  }

  getLocationRequestToProcessById(
    dto: GetLocationRequestToProcessByIdDto,
  ): Promise<LocationRequestResponseDto> {
    const locationRequestRepository = LocationRequestRepository(
      this.dataSource,
    );

    return locationRequestRepository
      .findOneOrFail({
        where: {
          id: dto.locationRequestId,
          status: LocationRequestStatus.AWAITING_ADMIN_REVIEW,
        },
        relations: ['createdBy'],
      })
      .then((e) => this.mapTo(LocationRequestResponseDto, e));
  }

  processLocationRequest(
    dto: ProcessLocationRequestDto,
  ): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const locationRequestRepository = LocationRequestRepository(em);

      const locationRequest = await locationRequestRepository.findOneByOrFail({
        id: dto.locationRequestId,
      });

      if (!locationRequest.canBeUpdated()) {
        throw new BadRequestException(
          'This location request cannot be updated',
        );
      }

      locationRequest.processedById = dto.accountId;
      locationRequest.status = dto.status;
      locationRequest.adminNotes = dto.adminNotes || null;

      return locationRequestRepository
        .update(
          {
            id: dto.locationRequestId,
          },
          locationRequest,
        )
        .then((res) => {
          this.eventEmitter.emit(LOCATION_REQUEST_APPROVED_EVENT, {
            locationRequest,
          } satisfies LocationRequestApprovedEvent);

          return res;
        });
    });
  }
}
