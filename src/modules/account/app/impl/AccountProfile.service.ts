import { Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IAccountProfileService } from '@/modules/account/app/IAccountProfile.service';
import { GetCreatorProfileDto } from '@/common/dto/account/GetCreatorProfile.dto';
import { CreatorProfileResponseDto } from '@/common/dto/account/res/CreatorProfile.response.dto';
import { CreatorProfileRepository } from '@/modules/account/infra/repository/CreatorProfile.repository';
import { UpdateResult } from 'typeorm';
import { UpdateCreatorProfileDto } from '@/common/dto/account/UpdateCreatorProfile.dto';

@Injectable()
export class AccountProfileService
  extends CoreService
  implements IAccountProfileService
{
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
