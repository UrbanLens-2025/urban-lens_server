import { DepositFundsDto } from '@/common/dto/wallet/DepositFunds.dto';
import { WalletResponseDto } from '@/common/dto/wallet/res/Wallet.response.dto';

export const IWalletActionService = Symbol('IWalletActionService');
export interface IWalletActionService {
  depositFunds(dto: DepositFundsDto): Promise<WalletResponseDto>;
}
