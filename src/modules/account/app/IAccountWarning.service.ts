import { AccountWarningResponseDto } from '@/common/dto/account/res/AccountWarning.response.dto';
import { SendWarningDto } from '@/common/dto/account/SendWarning.dto';
import { SuspendAccountDto } from '@/common/dto/account/SuspendAccount.dto';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { GetAccountSuspensionsDto } from '@/common/dto/account/GetAccountSuspensions.dto';
import { AccountSuspensionResponseDto } from '@/common/dto/account/res/AccountSuspension.response.dto';
import { Paginated } from 'nestjs-paginate';
import { AccountSuspensionEntity } from '@/modules/account/domain/AccountSuspension.entity';
import { AccountWarningEntity } from '@/modules/account/domain/AccountWarning.entity';
import { PaginateConfig } from 'nestjs-paginate';
import { LiftSuspensionDto } from '@/common/dto/account/LiftSuspension.dto';
import { GetAllWarningsDto } from '@/common/dto/account/GetAllWarnings.dto';
import { SuspendEventCreationDto } from '@/common/dto/account/SuspendEventCreation.dto';

export const IAccountWarningService = Symbol('IAccountWarningService');

export interface IAccountWarningService {
  sendWarning(dto: SendWarningDto): Promise<AccountWarningResponseDto>;

  suspendAccount(dto: SuspendAccountDto): Promise<AccountResponseDto>;

  suspendEventCreation(
    dto: SuspendEventCreationDto,
  ): Promise<AccountResponseDto>;

  getAccountSuspensions(
    dto: GetAccountSuspensionsDto,
  ): Promise<Paginated<AccountSuspensionResponseDto>>;

  liftSuspension(dto: LiftSuspensionDto): Promise<AccountSuspensionResponseDto>;

  getAllWarningsByAccountId(
    dto: GetAllWarningsDto,
  ): Promise<Paginated<AccountWarningResponseDto>>;
}

export namespace IAccountWarningService_QueryConfig {
  export function getAccountSuspensions(): PaginateConfig<AccountSuspensionEntity> {
    return {
      sortableColumns: ['createdAt', 'suspendedUntil'],
      defaultSortBy: [['createdAt', 'DESC']],
      filterableColumns: {
        accountId: true,
        isActive: true,
      },
      searchableColumns: ['suspensionReason'],
      relations: {
        account: true,
        suspendedBy: true,
      },
    };
  }

  export function getAllWarnings(): PaginateConfig<AccountWarningEntity> {
    return {
      sortableColumns: ['createdAt'],
      defaultSortBy: [['createdAt', 'DESC']],
      filterableColumns: {
        accountId: true,
      },
      searchableColumns: ['warningNote'],
      relations: {
        createdBy: true,
      },
    };
  }
}
