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
import { TagRepository } from '@/modules/account/infra/repository/Tag.repository';
import { UserTagsRepository } from '@/modules/account/infra/repository/UserTags.repository';

@Injectable({})
export class AccountUserService
  extends CoreService
  implements IAccountUserService
{
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly tagRepository: TagRepository,
    private readonly userTagsRepository: UserTagsRepository,
  ) {
    super();
  }

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

    // validate tags
    if (dto.tagIds) {
      const tags = await this.tagRepository.repo.findBy({
        id: In(dto.tagIds),
      });

      if (tags.length !== dto.tagIds.length) {
        throw new BadRequestException('One or more tags are invalid');
      }

      await this.userTagsRepository.repo.save(
        dto.tagIds.map((tagId) => ({
          tagId,
          userId: user.id,
        })),
      );
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
