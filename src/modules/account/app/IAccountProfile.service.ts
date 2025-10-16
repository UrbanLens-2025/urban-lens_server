import { GetCreatorProfileDto } from '@/common/dto/account/GetCreatorProfile.dto';
import { CreatorProfileResponseDto } from '@/common/dto/account/res/CreatorProfile.response.dto';
import { UpdateResult } from 'typeorm';
import { UpdateCreatorProfileDto } from '@/common/dto/account/UpdateCreatorProfile.dto';

export const IAccountProfileService = Symbol('IProfileService');
export interface IAccountProfileService {
  getCreatorProfile(
    dto: GetCreatorProfileDto,
  ): Promise<CreatorProfileResponseDto>;

  updateCreatorProfile(dto: UpdateCreatorProfileDto): Promise<UpdateResult>;
}
