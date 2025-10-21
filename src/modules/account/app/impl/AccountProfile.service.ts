import { Injectable, NotFoundException } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IAccountProfileService } from '@/modules/account/app/IAccountProfile.service';
import { GetCreatorProfileDto } from '@/common/dto/account/GetCreatorProfile.dto';
import { CreatorProfileResponseDto } from '@/common/dto/account/res/CreatorProfile.response.dto';
import { UserProfileResponseDto } from '@/common/dto/account/res/UserProfile.response.dto';
import { CreatorProfileRepository } from '@/modules/account/infra/repository/CreatorProfile.repository';
import { UserProfileRepository } from '@/modules/account/infra/repository/UserProfile.repository';
import { UpdateResult } from 'typeorm';
import { UpdateCreatorProfileDto } from '@/common/dto/account/UpdateCreatorProfile.dto';

@Injectable()
export class AccountProfileService
  extends CoreService
  implements IAccountProfileService
{
  constructor(private readonly userProfileRepository: UserProfileRepository) {
    super();
  }

  getCreatorProfile(
    dto: GetCreatorProfileDto,
  ): Promise<CreatorProfileResponseDto> {
    const creatorProfileRepository = CreatorProfileRepository(this.dataSource);
    return creatorProfileRepository
      .findOne({
        where: {
          accountId: dto.accountId,
        },
      })
      .then((res) => this.mapTo(CreatorProfileResponseDto, res));
  }

  async getUserProfile(userId: string): Promise<UserProfileResponseDto> {
    const userProfile = await this.userProfileRepository.repo.findOne({
      where: { accountId: userId },
    });

    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    return this.mapTo(UserProfileResponseDto, userProfile);
  }

  updateCreatorProfile(dto: UpdateCreatorProfileDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (manager) => {
      const creatorProfileRepository = CreatorProfileRepository(manager);
      await creatorProfileRepository.findOneByOrFail({
        accountId: dto.accountId,
      });

      return await creatorProfileRepository.update(
        { accountId: dto.accountId },
        { ...dto },
      );
    });
  }
}
