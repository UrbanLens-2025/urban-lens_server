import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IAccountManagementService } from '@/modules/account/app/IAccountManagement.service';
import { Not, UpdateResult } from 'typeorm';
import { ToggleAccountLockDto } from '@/common/dto/account/ToggleAccountLock.dto';
import { Role } from '@/common/constants/Role.constant';
import { AccountEntity } from '@/modules/account/domain/Account.entity';

@Injectable()
export class AccountManagementService
  extends CoreService
  implements IAccountManagementService
{
  toggleAccountLock(dto: ToggleAccountLockDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const result = await em.update(
        AccountEntity,
        { id: dto.accountId, role: Not(Role.ADMIN) },
        { isLocked: () => 'NOT "is_locked"' },
      );

      if (result.affected === 0) {
        const account = await em.findOne(AccountEntity, {
          where: { id: dto.accountId },
        });

        if (!account) {
          throw new NotFoundException('Account not found');
        }

        if (account.role === Role.ADMIN) {
          throw new ForbiddenException(
            'You are not authorized to toggle account lock',
          );
        }
      }

      return result;
    });
  }
}
