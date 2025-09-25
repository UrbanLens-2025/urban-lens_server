import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserAccountResponse } from '@/common/dto/auth/UserAccountResponse.dto';
import { AccountRepository } from '@/modules/auth/infra/repository/Account.repository';
import { CoreService } from '@/common/core/Core.service';
import { UserGetAccountInfo } from '@/common/dto/auth/UserGetAccountInfo.dto';
import { Role } from '@/common/constants/Role.constant';
import { In, UpdateResult } from 'typeorm';
import { IAccountUserService } from '@/modules/account/app/IAccount.user.service';
import { OnboardUser } from '@/common/dto/auth/Onboarding.dto';

@Injectable({})
export class AccountUserService
  extends CoreService
  implements IAccountUserService
{
  constructor(private readonly accountRepository: AccountRepository) {
    super();
  }

  // TODO: Finish onboarding flow
  async onboardUser(
    accountId: string,
    dto: OnboardUser.DTO,
  ): Promise<UpdateResult> {
    const user = await this.accountRepository.repo.findOneByOrFail({
      id: accountId,
    });

    if (user.hasOnboarded) {
      throw new BadRequestException('User has already onboarded');
    }

    Object.assign(user, dto);

    user.hasOnboarded = true;

    return await this.accountRepository.repo.update({ id: user.id }, user);
  }

  public async getAccountInfo(
    dto: UserGetAccountInfo.Dto,
  ): Promise<UserAccountResponse.Dto> {
    const res = await this.accountRepository.repo.findOneBy({
      id: dto.userId,
      role: In([Role.USER, Role.BUSINESS_OWNER]),
    });
    if (res == null) {
      throw new NotFoundException('User not found');
    }
    return this.mapTo(UserAccountResponse.Dto, res);
  }
}
