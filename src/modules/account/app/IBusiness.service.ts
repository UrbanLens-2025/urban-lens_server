import { CreateBusinessDto } from '@/common/dto/business/CreateBusiness.dto';
import { GetBusinessesQueryDto } from '@/common/dto/business/GetBusinessesQuery.dto';
import { UpdateBusinessStatusDto } from '@/common/dto/business/UpdateBusinessStatus.dto';
import { UpdateBusinessDto } from '@/common/dto/business/UpdateBusiness.dto';
import { BusinessEntity } from '@/modules/account/domain/Business.entity';

export const IBusinessService = Symbol('IBusinessService');

export interface IBusinessService {
  createBusiness(createBusinessDto: CreateBusinessDto): Promise<any>;
  getBusinessById(businessId: string): Promise<any>;
  getBusinessesWithPagination(queryParams: GetBusinessesQueryDto): Promise<any>;
  updateBusinessStatus(
    businessId: string,
    updateStatusDto: UpdateBusinessStatusDto,
    adminId: string,
  ): Promise<BusinessEntity>;
  updateBusiness(
    businessId: string,
    updateBusinessDto: UpdateBusinessDto,
    accountId: string,
  ): Promise<BusinessEntity>;
}
