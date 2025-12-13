import { AccountWarningResponseDto } from '@/common/dto/account/res/AccountWarning.response.dto';
import { SendWarningDto } from '@/common/dto/account/SendWarning.dto';
import { SuspendAccountDto } from '@/common/dto/account/SuspendAccount.dto';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';

export const IAccountWarningService = Symbol('IAccountWarningService');

export interface IAccountWarningService {
  sendWarning(dto: SendWarningDto): Promise<AccountWarningResponseDto>;

  suspendAccount(dto: SuspendAccountDto): Promise<AccountResponseDto>;
}
