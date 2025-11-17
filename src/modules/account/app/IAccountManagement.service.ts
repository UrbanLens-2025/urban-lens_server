import { UpdateResult } from 'typeorm';
import { ToggleAccountLockDto } from '@/common/dto/account/ToggleAccountLock.dto';

export const IAccountManagementService = Symbol('IAccountManagementService');
export interface IAccountManagementService {
  toggleAccountLock(dto: ToggleAccountLockDto): Promise<UpdateResult>;
}

