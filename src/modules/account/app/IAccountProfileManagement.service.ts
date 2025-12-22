import { UpdateResult } from 'typeorm';
import { UpdateCreatorProfileDto } from '@/common/dto/account/UpdateCreatorProfile.dto';
import { UpdateBusinessDto } from '@/common/dto/business/UpdateBusiness.dto';
import { UpdateBusinessStatusDto } from '@/common/dto/business/UpdateBusinessStatus.dto';

export const IAccountProfileManagementService = Symbol(
  'IAccountProfileManagementService',
);
export interface IAccountProfileManagementService {
  updateCreatorProfile(dto: UpdateCreatorProfileDto): Promise<UpdateResult>;
  updateBusinessBeforeApproval(
    updateBusinessDto: UpdateBusinessDto,
    accountId: string,
  ): Promise<UpdateResult>;
  processBusinessRequest(
    businessId: string,
    updateStatusDto: UpdateBusinessStatusDto,
    accountId: string,
  ): Promise<UpdateResult>;
}
