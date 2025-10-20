import { BadRequestException, Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IOnboardService } from '@/modules/account/app/IOnboard.service';
import { OnboardCreatorDto } from '@/common/dto/account/OnboardCreator.dto';
import { OnboardUserDto } from '@/common/dto/account/OnboardUser.dto';
import { In, MoreThan, UpdateResult } from 'typeorm';
import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';
import { AccountEntity } from '@/modules/auth/domain/Account.entity';
import { TagEntity } from '@/modules/account/domain/Tag.entity';
import { UserTagsEntity } from '@/modules/account/domain/UserTags.entity';
import { CreatorProfileEntity } from '@/modules/account/domain/CreatorProfile.entity';
import { Role } from '@/common/constants/Role.constant';
import { CreatorProfileRepository } from '@/modules/account/infra/repository/CreatorProfile.repository';
import { RankRepository } from '@/modules/gamification/infra/repository/Rank.repository';
import { RankEntity } from '@/modules/gamification/domain/Rank.entity';

@Injectable()
export class OnboardService extends CoreService implements IOnboardService {
  constructor(private readonly rankRepository: RankRepository) {
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
            accountId: account.id,
          })),
        );
      }

      console.log('11111');
      // Get the lowest rank (smallest minPoints)
      const lowestRank = await manager.getRepository(RankEntity).findOne({
        where: { minPoints: MoreThan(0) },
        order: { minPoints: 'ASC' },
      });

      console.log('22222');

      if (!lowestRank) {
        throw new BadRequestException(
          'No ranks found in system. Please create ranks first.',
        );
      }

      await userProfileRepository.save({
        accountId: account.id,
        rankId: lowestRank.id,
        points: 0,
        ...dto,
      });

      account.hasOnboarded = true;
      account.avatarUrl = dto.avatarUrl ?? null;
      account.coverUrl = dto.coverUrl ?? null;

      return await accountRepository.update({ id: account.id }, account);
    });
  }

  onboardCreator(
    accountId: string,
    dto: OnboardCreatorDto,
  ): Promise<UpdateResult> {
    return this.dataSource.transaction(async (manager) => {
      const accountRepository = manager.getRepository(AccountEntity);
      const creatorProfileRepository = CreatorProfileRepository(manager);

      const account = await accountRepository.findOneByOrFail({
        id: accountId,
        role: Role.EVENT_CREATOR,
      });

      if (account.hasOnboarded) {
        throw new BadRequestException('User has already onboarded');
      }

      const creatorProfile = this.mapTo_Raw(CreatorProfileEntity, dto);
      creatorProfile.accountId = account.id;
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
