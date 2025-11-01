import { DepositFundsDto } from '@/common/dto/wallet/DepositFunds.dto';
import { WalletResponseDto } from '@/common/dto/wallet/res/Wallet.response.dto';
import { WithdrawFundsDto } from '@/common/dto/wallet/WithdrawFunds.dto';
import { TransferFundsBetweenWalletsDto } from '@/common/dto/wallet/TransferFundsBetweenWallets.dto';

export const IWalletActionService = Symbol('IWalletActionService');
export interface IWalletActionService {
  depositFunds(dto: DepositFundsDto): Promise<WalletResponseDto>;
  withdrawFunds(dto: WithdrawFundsDto): Promise<WalletResponseDto>;

  transferFundsBetweenWallets(
    dto: TransferFundsBetweenWalletsDto,
  ): Promise<void>;
}
