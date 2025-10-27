import { DepositFundsDto } from '@/common/dto/wallet/DepositFunds.dto';

export const IWalletActionService = Symbol('IWalletActionService');
export interface IWalletActionService {
  depositFunds(dto: DepositFundsDto): Promise<void>;
}
