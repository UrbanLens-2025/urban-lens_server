import { Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IAccountManagementService } from '@/modules/account/app/IAccountManagement.service';
import { UpdateResult } from 'typeorm';
import { ToggleAccountLockDto } from '@/common/dto/account/ToggleAccountLock.dto';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';

@Injectable()
export class AccountManagementService
  extends CoreService
  implements IAccountManagementService
{
  toggleAccountLock(dto: ToggleAccountLockDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const accountRepository = AccountRepositoryProvider(em);

      const account = await accountRepository.findOneOrFail({
        where: { id: dto.accountId },
      });

      return await accountRepository.update(
        { id: dto.accountId },
        { isLocked: !account.isLocked },
      );
    });
  }
}
