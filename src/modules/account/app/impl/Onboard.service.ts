import { BadRequestException, Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IOnboardService } from '@/modules/account/app/IOnboard.service';
import { OnboardCreatorDto } from '@/common/dto/account/OnboardCreator.dto';
import { OnboardUserDto } from '@/common/dto/account/OnboardUser.dto';
import { DataSource, In, UpdateResult } from 'typeorm';
import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';
import { AccountEntity } from '@/modules/auth/domain/Account.entity';
import { TagEntity } from '@/modules/account/domain/Tag.entity';
import { UserTagsEntity } from '@/modules/account/domain/UserTags.entity';
import { CreatorProfileEntity } from '@/modules/account/domain/CreatorProfile.entity';
import { Role } from '@/common/constants/Role.constant';

@Injectable()
export class OnboardService extends CoreService implements IOnboardService {
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  async onboardUser(
    accountId: string,
    dto: OnboardUserDto,
  ): Promise<UpdateResult> {
    return this.dataSource.transaction(async (manager) => {
      const accountRepository = manager.getRepository(AccountEntity);
      const tagRepository = manager.getRepository(TagEntity);
      const userTagsRepository = manager.getRepository(UserTagsEntity);
      const userProfileRepository = manager.getRepository(UserProfileEntity);

      const account = await accountRepository.findOneByOrFail({
        id: accountId,
        role: Role.USER,
      });

      if (account.hasOnboarded) {
        throw new BadRequestException('User has already onboarded');
      }

      // validate tags
      if (dto.tagIds) {
        const tags = await tagRepository.findBy({
          id: In(dto.tagIds),
        });

        if (tags.length !== dto.tagIds.length) {
          throw new BadRequestException('One or more tags are invalid');
        }

        await userTagsRepository.save(
          dto.tagIds.map((tagId) => ({
            tagId,
            userId: account.id,
          })),
        );
      }

      await userProfileRepository.save({
        accountId: account.id,
        ...dto,
      });

      return await accountRepository.update(
        { id: account.id },
        {
          ...dto,
          hasOnboarded: true,
        },
      );
    });
  }

  onboardCreator(
    accountId: string,
    dto: OnboardCreatorDto,
  ): Promise<UpdateResult> {
    return this.dataSource.transaction(async (manager) => {
      const accountRepository = manager.getRepository(AccountEntity);
      const creatorProfileRepository =
        manager.getRepository(CreatorProfileEntity);

      const account = await accountRepository.findOneByOrFail({
        id: accountId,
        role: Role.EVENT_CREATOR,
      });

      if (account.hasOnboarded) {
        throw new BadRequestException('User has already onboarded');
      }

      const creatorProfile = this.mapTo_Raw(CreatorProfileEntity, dto);
      creatorProfile.accountId = account.id;
      console.log(creatorProfile);
      await creatorProfileRepository.save(creatorProfile);

      return await accountRepository.update(
        { id: account.id },
        {
          avatarUrl: dto.avatarUrl,
          coverUrl: dto.coverUrl,
          hasOnboarded: true,
        },
      );
    });
  }
}
