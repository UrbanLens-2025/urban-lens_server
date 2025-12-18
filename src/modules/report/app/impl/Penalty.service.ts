import { CoreService } from '@/common/core/Core.service';
import { IPenaltyService } from '@/modules/report/app/IPenalty.service';
import { CreatePenalty_WarnUserDto } from '@/common/dto/report/CreatePenalty_WarnUser.dto';
import { CreatePenalty_SuspendAccountDto } from '@/common/dto/report/CreatePenalty_SuspendAccount.dto';
import { CreatePenalty_BanAccountDto } from '@/common/dto/report/CreatePenalty_BanAccount.dto';
import { CreatePenalty_SuspendLocationBookingAbilityDto } from '@/common/dto/report/CreatePenalty_SuspendLocationBookingAbility.dto';
import { CreatePenalty_BanPostDto } from '@/common/dto/report/CreatePenalty_BanPost.dto';
import { GetPenaltiesByTargetDto } from '@/common/dto/report/GetPenaltiesByTarget.dto';
import { GetPenaltiesByTargetOwnerDto } from '@/common/dto/report/GetPenaltiesByTargetOwner.dto';
import { PenaltyRepositoryProvider } from '@/modules/report/infra/repository/Penalty.repository';
import { PenaltyEntity } from '@/modules/report/domain/Penalty.entity';
import { ReportPenaltyActions } from '@/common/constants/ReportPenaltyActions.constant';
import { PenaltyResponseDto } from '@/common/dto/report/res/Penalty.response.dto';
import { Inject, Injectable } from '@nestjs/common';
import { IAccountWarningService } from '@/modules/account/app/IAccountWarning.service';
import { ReportEntityType } from '@/modules/report/domain/Report.entity';
import { EntityManager } from 'typeorm';
import { PostRepositoryProvider } from '@/modules/post/infra/repository/Post.repository';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import dayjs from 'dayjs';
import { ILocationBookingManagementService } from '@/modules/location-booking/app/ILocationBookingManagement.service';
import { ILocationManagementService } from '@/modules/business/app/ILocationManagement.service';
import { ILocationSuspensionService } from '@/modules/business/app/ILocationSuspension.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PENALTY_ADMINISTERED_EVENT,
  PenaltyAdministeredEvent,
} from '@/modules/report/domain/events/PenaltyAdministered.event';
import { IPostService } from '@/modules/post/app/IPost.service';
import { CreatePenalty_SuspendEventCreationAbilityDto } from '@/common/dto/report/CreatePenalty_SuspendEventCreationAbility.dto';
import { CreatePenalty_ForceCancelEventDto } from '@/common/dto/report/CreatePenalty_ForceCancelEvent.dto';
import { IEventManagementService } from '@/modules/event/app/IEventManagement.service';
import { CreatePenalty_SuspendLocationDto } from '@/common/dto/report/CreatePenalty_SuspendLocation.dto';

/**
 * For functions in this service, create penalty then delegate.
 */
@Injectable()
export class PenaltyService extends CoreService implements IPenaltyService {
  constructor(
    @Inject(IAccountWarningService)
    private readonly accountWarningService: IAccountWarningService,
    @Inject(ILocationSuspensionService)
    private readonly locationSuspensionService: ILocationSuspensionService,
    @Inject(IPostService)
    private readonly postService: IPostService,
    @Inject(IEventManagementService)
    private readonly eventManagementService: IEventManagementService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  createPenalty_WarnUser(
    dto: CreatePenalty_WarnUserDto,
  ): Promise<PenaltyResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const penaltyRepository = PenaltyRepositoryProvider(em);

      const toAdministerTo = await this.getEntityOwnerId({
        em,
        entityId: dto.targetEntityId,
        entityType: dto.targetEntityType,
      });

      const penalty = new PenaltyEntity();
      penalty.targetId = dto.targetEntityId;
      penalty.targetType = dto.targetEntityType;
      penalty.targetOwnerId = toAdministerTo;
      penalty.penaltyAction = ReportPenaltyActions.WARN_USER;
      penalty.reason = dto.warningNote;
      penalty.createdById = dto.createdById;

      return penaltyRepository
        .save(penalty)
        .then(async (res) => {
          // delegate to account warning service to send warning
          await this.accountWarningService.sendWarning({
            createdById: dto.createdById,
            targetAccountId: toAdministerTo,
            warningNote: dto.warningNote,
            entityManager: em,
          });
          return res;
        })
        .then((res) => {
          this.eventEmitter.emit(
            PENALTY_ADMINISTERED_EVENT,
            new PenaltyAdministeredEvent(res.id, toAdministerTo),
          );
          return res;
        });
    }).then((res) => this.mapTo(PenaltyResponseDto, res));
  }

  createPenalty_SuspendAccount(
    dto: CreatePenalty_SuspendAccountDto,
  ): Promise<PenaltyResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const penaltyRepository = PenaltyRepositoryProvider(em);
      const toAdministerTo = await this.getEntityOwnerId({
        em,
        entityId: dto.targetEntityId,
        entityType: dto.targetEntityType,
      });

      const penalty = new PenaltyEntity();
      penalty.targetId = dto.targetEntityId;
      penalty.targetType = dto.targetEntityType;
      penalty.targetOwnerId = toAdministerTo;
      penalty.penaltyAction = ReportPenaltyActions.SUSPEND_ACCOUNT;
      penalty.reason =
        dto.suspensionReason +
        '. Suspended until: ' +
        dto.suspendUntil.toLocaleDateString();
      penalty.createdById = dto.createdById;

      return penaltyRepository
        .save(penalty)
        .then(async (res) => {
          await this.accountWarningService.suspendAccount({
            suspendUntil: dto.suspendUntil,
            suspensionReason: dto.suspensionReason,
            targetId: toAdministerTo,
            accountId: dto.createdById,
            entityManager: em,
          });
          return res;
        })
        .then((res) => {
          this.eventEmitter.emit(
            PENALTY_ADMINISTERED_EVENT,
            new PenaltyAdministeredEvent(res.id, toAdministerTo),
          );
          return res;
        });
    }).then((res) => this.mapTo(PenaltyResponseDto, res));
  }

  createPenalty_BanAccount(
    dto: CreatePenalty_BanAccountDto,
  ): Promise<PenaltyResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const penaltyRepository = PenaltyRepositoryProvider(em);
      const toAdministerTo = await this.getEntityOwnerId({
        em,
        entityId: dto.targetEntityId,
        entityType: dto.targetEntityType,
      });

      const penalty = new PenaltyEntity();
      penalty.targetId = dto.targetEntityId;
      penalty.targetType = dto.targetEntityType;
      penalty.targetOwnerId = toAdministerTo;
      penalty.penaltyAction = ReportPenaltyActions.BAN_ACCOUNT;
      penalty.reason = dto.suspensionReason;
      penalty.createdById = dto.createdById;

      return penaltyRepository
        .save(penalty)
        .then(async (res) => {
          await this.accountWarningService.suspendAccount({
            suspendUntil: dayjs().add(999, 'years').toDate(),
            suspensionReason: dto.suspensionReason,
            targetId: toAdministerTo,
            accountId: dto.createdById,
            entityManager: em,
          });
          return res;
        })
        .then((res) => {
          this.eventEmitter.emit(
            PENALTY_ADMINISTERED_EVENT,
            new PenaltyAdministeredEvent(res.id, toAdministerTo),
          );
          return res;
        });
    }).then((res) => this.mapTo(PenaltyResponseDto, res));
  }

  createPenalty_SuspendLocationBookingAbility(
    dto: CreatePenalty_SuspendLocationBookingAbilityDto,
  ): Promise<PenaltyResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const penaltyRepository = PenaltyRepositoryProvider(em);

      const toAdministerTo = await this.getEntityOwnerId({
        em,
        entityId: dto.targetEntityId,
        entityType: dto.targetEntityType,
      });

      const penalty = new PenaltyEntity();
      penalty.targetId = dto.targetEntityId;
      penalty.targetType = dto.targetEntityType;
      penalty.targetOwnerId = toAdministerTo;
      penalty.penaltyAction = ReportPenaltyActions.SUSPEND_LOCATION_BOOKING;
      penalty.reason =
        dto.suspensionReason +
        '. Suspended until: ' +
        dto.suspendedUntil.toLocaleDateString();
      penalty.createdById = dto.createdById;

      return penaltyRepository
        .save(penalty)
        .then(async (res) => {
          await this.locationSuspensionService.suspendLocationBooking({
            entityManager: em,
            locationId: dto.targetEntityId,
            suspendedUntil: dto.suspendedUntil,
            suspensionReason: dto.suspensionReason,
            accountId: dto.createdById,
          });
          return res;
        })
        .then((res) => {
          this.eventEmitter.emit(
            PENALTY_ADMINISTERED_EVENT,
            new PenaltyAdministeredEvent(res.id, toAdministerTo),
          );
          return res;
        });
    }).then((res) => this.mapTo(PenaltyResponseDto, res));
  }

  createPenalty_BanPost(
    dto: CreatePenalty_BanPostDto,
  ): Promise<PenaltyResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const penaltyRepository = PenaltyRepositoryProvider(em);
      const toAdministerTo = await this.getEntityOwnerId({
        em,
        entityId: dto.targetEntityId,
        entityType: dto.targetEntityType,
      });

      const penalty = new PenaltyEntity();
      penalty.targetId = dto.targetEntityId;
      penalty.targetType = dto.targetEntityType;
      penalty.targetOwnerId = toAdministerTo;
      penalty.penaltyAction = ReportPenaltyActions.BAN_POST;
      penalty.reason = dto.banReason;
      penalty.createdById = dto.createdById;

      return penaltyRepository
        .save(penalty)
        .then(async (res) => {
          await this.postService.banPost(dto.targetEntityId, dto.banReason, em);
          return res;
        })
        .then((res) => {
          this.eventEmitter.emit(
            PENALTY_ADMINISTERED_EVENT,
            new PenaltyAdministeredEvent(res.id, toAdministerTo),
          );
          return res;
        });
    }).then((res) => this.mapTo(PenaltyResponseDto, res));
  }

  createPenalty_SuspendEventCreationAbility(
    dto: CreatePenalty_SuspendEventCreationAbilityDto,
  ): Promise<PenaltyResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const penaltyRepository = PenaltyRepositoryProvider(em);
      const toAdministerTo = await this.getEntityOwnerId({
        em,
        entityId: dto.targetEntityId,
        entityType: dto.targetEntityType,
      });

      const penalty = new PenaltyEntity();
      penalty.targetId = dto.targetEntityId;
      penalty.targetType = dto.targetEntityType;
      penalty.targetOwnerId = toAdministerTo;
      penalty.penaltyAction = ReportPenaltyActions.SUSPEND_EVENT_CREATION;
      penalty.reason =
        dto.suspensionReason +
        '. Suspended until: ' +
        dto.suspendUntil.toLocaleDateString();
      penalty.createdById = dto.createdById;

      return penaltyRepository
        .save(penalty)
        .then(async (res) => {
          await this.accountWarningService.suspendEventCreation({
            accountId: toAdministerTo,
            suspendedUntil: dto.suspendUntil,
          });
          return res;
        })
        .then((res) => {
          this.eventEmitter.emit(
            PENALTY_ADMINISTERED_EVENT,
            new PenaltyAdministeredEvent(res.id, toAdministerTo),
          );
          return res;
        });
    }).then((res) => this.mapTo(PenaltyResponseDto, res));
  }

  createPenalty_ForceCancelEvent(
    dto: CreatePenalty_ForceCancelEventDto,
  ): Promise<PenaltyResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const penaltyRepository = PenaltyRepositoryProvider(em);
      const toAdministerTo = await this.getEntityOwnerId({
        em,
        entityId: dto.targetEntityId,
        entityType: dto.targetEntityType,
      });

      const penalty = new PenaltyEntity();
      penalty.targetId = dto.targetEntityId;
      penalty.targetType = dto.targetEntityType;
      penalty.targetOwnerId = toAdministerTo;
      penalty.penaltyAction = ReportPenaltyActions.FORCE_CANCEL_EVENT;
      penalty.reason = dto.reason;
      penalty.createdById = dto.createdById;

      return penaltyRepository
        .save(penalty)
        .then(async (res) => {
          await this.eventManagementService.handleForceCancelEvent({
            eventId: dto.targetEntityId,
            entityManager: em,
          });
          return res;
        })
        .then((res) => {
          this.eventEmitter.emit(
            PENALTY_ADMINISTERED_EVENT,
            new PenaltyAdministeredEvent(res.id, toAdministerTo),
          );
          return res;
        });
    }).then((res) => this.mapTo(PenaltyResponseDto, res));
  }

  createPenalty_SuspendLocation(
    dto: CreatePenalty_SuspendLocationDto,
  ): Promise<PenaltyResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const penaltyRepository = PenaltyRepositoryProvider(em);
      const toAdministerTo = await this.getEntityOwnerId({
        em,
        entityId: dto.targetEntityId,
        entityType: dto.targetEntityType,
      });

      const penalty = new PenaltyEntity();
      penalty.targetId = dto.targetEntityId;
      penalty.targetType = dto.targetEntityType;
      penalty.targetOwnerId = toAdministerTo;
      penalty.penaltyAction = ReportPenaltyActions.SUSPEND_LOCATION;
      penalty.reason =
        dto.suspensionReason +
        '. Suspended until: ' +
        dto.suspendedUntil.toLocaleDateString('vi-VN');
      penalty.createdById = dto.createdById;

      return penaltyRepository
        .save(penalty)
        .then(async (res) => {
          await this.locationSuspensionService.suspendLocation({
            locationId: dto.targetEntityId,
            executedById: dto.createdById,
            reason: dto.suspensionReason,
            suspendedUntil: dto.suspendedUntil,
            entityManager: em,
          });
          return res;
        })
        .then((res) => {
          this.eventEmitter.emit(
            PENALTY_ADMINISTERED_EVENT,
            new PenaltyAdministeredEvent(res.id, toAdministerTo),
          );
          return res;
        });
    }).then((res) => this.mapTo(PenaltyResponseDto, res));
  }

  private async getEntityOwnerId(payload: {
    entityType: ReportEntityType;
    entityId: string;
    em: EntityManager;
  }) {
    switch (payload.entityType) {
      case ReportEntityType.POST: {
        const postRepo = PostRepositoryProvider(payload.em);
        const post = await postRepo.findOneOrFail({
          where: { postId: payload.entityId },
        });
        return post.authorId;
      }
      case ReportEntityType.LOCATION: {
        const locationRepo = LocationRepositoryProvider(payload.em);
        const location = await locationRepo.findOneOrFail({
          where: { id: payload.entityId },
        });
        return location.businessId;
      }
      case ReportEntityType.EVENT: {
        const eventRepo = EventRepository(payload.em);
        const event = await eventRepo.findOneOrFail({
          where: { id: payload.entityId },
        });
        return event.createdById;
      }
      default: {
        throw new Error(
          `Unknown entity type: ${payload.entityType as unknown as string}`,
        );
      }
    }
  }

  getPenaltiesByTarget(
    dto: GetPenaltiesByTargetDto,
  ): Promise<PenaltyResponseDto[]> {
    return this.ensureTransaction(null, async (em) => {
      const penaltyRepository = PenaltyRepositoryProvider(em);
      const penalties = await penaltyRepository.find({
        where: {
          targetId: dto.targetId,
          targetType: dto.targetType,
        },
        relations: ['createdBy'],
        order: {
          createdAt: 'DESC',
        },
      });
      return this.mapToArray(PenaltyResponseDto, penalties);
    });
  }

  getPenaltiesByTargetOwner(
    dto: GetPenaltiesByTargetOwnerDto,
  ): Promise<PenaltyResponseDto[]> {
    return this.ensureTransaction(null, async (em) => {
      const penaltyRepository = PenaltyRepositoryProvider(em);
      const penalties = await penaltyRepository.find({
        where: {
          targetOwnerId: dto.targetOwnerId,
        },
        relations: ['createdBy'],
        order: {
          createdAt: 'DESC',
        },
      });
      return this.mapToArray(PenaltyResponseDto, penalties);
    });
  }
}
