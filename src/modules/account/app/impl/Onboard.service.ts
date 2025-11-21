import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IOnboardService } from '@/modules/account/app/IOnboard.service';
import { OnboardCreatorDto } from '@/common/dto/account/OnboardCreator.dto';
import { OnboardUserDto } from '@/common/dto/account/OnboardUser.dto';
import { In, UpdateResult } from 'typeorm';
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { CreatorProfileEntity } from '@/modules/account/domain/CreatorProfile.entity';
import { Role } from '@/common/constants/Role.constant';
import { CreatorProfileRepository } from '@/modules/account/infra/repository/CreatorProfile.repository';
import { UserLoginResponseDto } from '@/common/dto/auth/res/UserLoginResponse.dto';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';
import { TokenService } from '@/common/core/token/token.service';
import { CreateBusinessDto } from '@/common/dto/business/CreateBusiness.dto';
import { BusinessRepositoryProvider } from '@/modules/account/infra/repository/Business.repository';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { BusinessEntity } from '@/modules/account/domain/Business.entity';
import { BusinessResponseDto } from '@/common/dto/account/res/Business.response.dto';
import { UserProfileRepositoryProvider } from '@/modules/account/infra/repository/UserProfile.repository';
import { TagCategoryRepositoryProvider } from '@/modules/utility/infra/repository/TagCategory.repository';
import { RankRepositoryProvider } from '@/modules/gamification/infra/repository/Rank.repository';
import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';

@Injectable()
export class OnboardService extends CoreService implements IOnboardService {
  constructor(
    private readonly tokenService: TokenService,
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {
    super();
  }

  async onboardUser(
    accountId: string,
    dto: OnboardUserDto,
  ): Promise<UserLoginResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const accountRepository = AccountRepositoryProvider(manager);
      const userProfileRepository = UserProfileRepositoryProvider(manager);
      const tagCategoryRepository = TagCategoryRepositoryProvider(manager);
      const rankRepository = RankRepositoryProvider(manager);

      const account = await accountRepository
        .findOneByOrFail({
          id: accountId,
          role: Role.USER,
        })
        .then((account) => {
          if (account.hasOnboarded) {
            throw new BadRequestException('User has already onboarded');
          }
          return account;
        });

      // confirm uploads
      await this.fileStorageService.confirmUpload(
        [dto.avatarUrl, dto.coverUrl],
        manager,
      );

      // validate and apply tag categories
      const initialTagScores: Record<string, number> = {};

      if (dto.categoryIds && dto.categoryIds.length > 0) {
        const categories = await tagCategoryRepository.findBy({
          id: In(dto.categoryIds),
        });

        if (categories.length !== dto.categoryIds.length) {
          throw new BadRequestException('One or more categories are invalid');
        }

        // Merge all category weights into initial tag scores
        for (const category of categories) {
          const weights = category.tagScoreWeights || {};
          for (const [tagKey, weight] of Object.entries(weights)) {
            initialTagScores[tagKey] = (initialTagScores[tagKey] || 0) + weight;
          }
        }
      }

      // Get the lowest rank (smallest minPoints)
      const startingRank = await rankRepository.getStartingRank();

      const userProfileEntity = this.mapTo_safe(UserProfileEntity, dto);
      userProfileEntity.accountId = account.id;
      userProfileEntity.rankId = startingRank.id;
      userProfileEntity.points = 0;
      userProfileEntity.tagScores = initialTagScores;

      await userProfileRepository.save(userProfileEntity);

      account.hasOnboarded = true;
      account.avatarUrl = dto.avatarUrl ?? null;
      account.coverUrl = dto.coverUrl ?? null;

      return await accountRepository
        .update({ id: account.id }, account)
        // return account details with new token
        .then(async () => {
          const response = new UserLoginResponseDto();
          response.user = this.mapTo(AccountResponseDto, account);
          response.token = await this.tokenService.generateToken(account);
          return response;
        });
    });
  }

  onboardCreator(
    accountId: string,
    dto: OnboardCreatorDto,
  ): Promise<UpdateResult> {
    return this.dataSource.transaction(async (manager) => {
      const accountRepository = AccountRepositoryProvider(manager);
      const creatorProfileRepository = CreatorProfileRepository(manager);

      const account = await accountRepository
        .findOneByOrFail({
          id: accountId,
          role: Role.EVENT_CREATOR,
        })
        .then((account) => {
          if (account.hasOnboarded) {
            throw new BadRequestException('Creator has already onboarded');
          }
          return account;
        });

      // confirm uploads
      await this.fileStorageService.confirmUpload(
        [dto.avatarUrl, dto.coverUrl],
        manager,
      );

      const creatorProfile = this.mapTo_safe(CreatorProfileEntity, dto);
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

  async onboardOwner(
    accountId: string,
    createBusinessDto: CreateBusinessDto,
  ): Promise<BusinessResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const businessRepository = BusinessRepositoryProvider(em);
      const accountRepository = AccountRepositoryProvider(em);

      const account = await accountRepository
        .findOneOrFail({
          where: { id: accountId, role: Role.BUSINESS_OWNER },
        })
        .then((account) => {
          if (account.hasOnboarded) {
            throw new BadRequestException(
              'Business owner has already onboarded',
            );
          }
          return account;
        });

      await this.fileStorageService.confirmUpload(
        [createBusinessDto.avatar],
        em,
      );

      const business = this.mapTo_safe(BusinessEntity, createBusinessDto);
      business.accountId = account.id;

      return businessRepository
        .save(business)
        .then(async (res) => {
          await accountRepository.update(
            {
              id: account.id,
            },
            {
              hasOnboarded: true,
            },
          );

          return res;
        })
        .then((res) => this.mapTo(BusinessResponseDto, res));
    });
  }
}
