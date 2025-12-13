import { CoreService } from '@/common/core/Core.service';
import { IAccountWarningService } from '@/modules/account/app/IAccountWarning.service';
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
import {
  AccountRepository,
  AccountRepositoryProvider,
} from '@/modules/account/infra/repository/Account.repository';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';

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
      warning.accountId = dto.accountId;
      warning.warningNote = dto.warningNote;

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
      const account = await accountRepo.findOneOrFail({
        where: { id: dto.targetId },
      });

      account.suspend(dto.suspendUntil, dto.suspensionReason, dto.accountId);

      return accountRepo.save(account);
    }).then((res) => this.mapTo(AccountResponseDto, res));
  }
}
