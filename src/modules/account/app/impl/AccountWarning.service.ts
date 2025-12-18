import { CoreService } from '@/common/core/Core.service';
import {
  IAccountWarningService,
  IAccountWarningService_QueryConfig,
} from '@/modules/account/app/IAccountWarning.service';
import { Injectable } from '@nestjs/common';
import { SendWarningDto } from '@/common/dto/account/SendWarning.dto';
import { SuspendAccountDto } from '@/common/dto/account/SuspendAccount.dto';
import { AccountWarningRepository } from '@/modules/account/infra/repository/AccountWarning.repository';
import { AccountWarningEntity } from '@/modules/account/domain/AccountWarning.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ACCOUNT_WARNING_CREATED_EVENT,
  AccountWarningCreatedEvent,
} from '@/modules/account/domain/events/AccountWarningCreated.event';
import { AccountWarningResponseDto } from '@/common/dto/account/res/AccountWarning.response.dto';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { AccountSuspensionRepository } from '@/modules/account/infra/repository/AccountSuspension.repository';
import { AccountSuspensionEntity } from '@/modules/account/domain/AccountSuspension.entity';
import { MoreThan } from 'typeorm';
import { GetAccountSuspensionsDto } from '@/common/dto/account/GetAccountSuspensions.dto';
import { AccountSuspensionResponseDto } from '@/common/dto/account/res/AccountSuspension.response.dto';
import { Paginated, paginate } from 'nestjs-paginate';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Role } from '@/common/constants/Role.constant';
import { LiftSuspensionDto } from '@/common/dto/account/LiftSuspension.dto';
import { GetAllWarningsDto } from '@/common/dto/account/GetAllWarnings.dto';
import { SuspendEventCreationDto } from '@/common/dto/account/SuspendEventCreation.dto';
import { CreatorProfileRepository } from '@/modules/account/infra/repository/CreatorProfile.repository';

@Injectable()
export class AccountWarningService
  extends CoreService
  implements IAccountWarningService
{
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  sendWarning(dto: SendWarningDto): Promise<AccountWarningResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const accountWarningRepo = AccountWarningRepository(em);

      const warning = new AccountWarningEntity();
      warning.accountId = dto.targetAccountId;
      warning.warningNote = dto.warningNote;
      warning.createdById = dto.createdById;

      return accountWarningRepo.save(warning);
    })
      .then((res) => {
        this.eventEmitter.emit(
          ACCOUNT_WARNING_CREATED_EVENT,
          new AccountWarningCreatedEvent(res.id, res.accountId),
        );
        return res;
      })
      .then((res) => this.mapTo(AccountWarningResponseDto, res));
  }

  suspendAccount(dto: SuspendAccountDto): Promise<AccountResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const accountRepo = AccountRepositoryProvider(em);
      const accountSuspensionRepo = AccountSuspensionRepository(em);

      const account = await accountRepo.findOneOrFail({
        where: { id: dto.targetId },
      });

      // Prevent suspending ADMIN accounts
      if (account.role === Role.ADMIN) {
        throw new BadRequestException('Cannot suspend ADMIN accounts');
      }

      // Only allow suspending USER, BUSINESS_OWNER, and EVENT_CREATOR
      if (
        account.role !== Role.USER &&
        account.role !== Role.BUSINESS_OWNER &&
        account.role !== Role.EVENT_CREATOR
      ) {
        throw new BadRequestException(
          'Can only suspend USER, BUSINESS_OWNER, or EVENT_CREATOR accounts',
        );
      }

      // Check if there exists an active suspension that hasn't expired and deactivate it
      const now = new Date();
      await accountSuspensionRepo.update(
        {
          accountId: dto.targetId,
          isActive: true,
          suspendedUntil: MoreThan(now),
        },
        {
          isActive: false,
        },
      );

      // Create new suspension record
      const suspension = new AccountSuspensionEntity();
      suspension.accountId = dto.targetId;
      suspension.suspendedUntil = dto.suspendUntil;
      suspension.suspensionReason = dto.suspensionReason;
      suspension.suspendedById = dto.accountId;
      suspension.isActive = true;

      await accountSuspensionRepo.save(suspension);

      return account;
    }).then((res) => this.mapTo(AccountResponseDto, res));
  }

  suspendEventCreation(
    dto: SuspendEventCreationDto,
  ): Promise<AccountResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const accountRepo = AccountRepositoryProvider(em);
      const creatorProfileRepo = CreatorProfileRepository(em);
      const account = await accountRepo.findOneOrFail({
        where: { id: dto.accountId },
        relations: {
          creatorProfile: true,
        },
      });

      if (account.role !== Role.EVENT_CREATOR) {
        throw new BadRequestException('Account is not an EVENT_CREATOR');
      }

      if (!account.creatorProfile) {
        throw new BadRequestException('This account has not onboarded');
      }

      account.creatorProfile.eventCreationSuspendedUntil = dto.suspendedUntil;

      await creatorProfileRepo.save(account.creatorProfile);

      return account;
    }).then((res) => this.mapTo(AccountResponseDto, res));
  }

  getAccountSuspensions(
    dto: GetAccountSuspensionsDto,
  ): Promise<Paginated<AccountSuspensionResponseDto>> {
    return paginate(dto.query, AccountSuspensionRepository(this.dataSource), {
      ...IAccountWarningService_QueryConfig.getAccountSuspensions(),
      where: {
        accountId: dto.accountId,
      },
    }).then((res) => this.mapToPaginated(AccountSuspensionResponseDto, res));
  }

  liftSuspension(
    dto: LiftSuspensionDto,
  ): Promise<AccountSuspensionResponseDto> {
    return this.ensureTransaction(dto.entityManager, async (em) => {
      const accountSuspensionRepo = AccountSuspensionRepository(em);

      const suspension = await accountSuspensionRepo.findOne({
        where: { id: dto.suspensionId, accountId: dto.targetAccountId },
      });

      if (!suspension) {
        throw new NotFoundException('Suspension not found');
      }

      suspension.isActive = false;

      return accountSuspensionRepo.save(suspension);
    }).then((res) => this.mapTo(AccountSuspensionResponseDto, res));
  }

  getAllWarningsByAccountId(
    dto: GetAllWarningsDto,
  ): Promise<Paginated<AccountWarningResponseDto>> {
    return paginate(dto.query, AccountWarningRepository(this.dataSource), {
      ...IAccountWarningService_QueryConfig.getAllWarnings(),
      where: {
        accountId: dto.accountId,
      },
    }).then((res) => this.mapToPaginated(AccountWarningResponseDto, res));
  }
}
