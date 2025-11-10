import { DepositFundsDto } from '@/common/dto/wallet/DepositFunds.dto';
import { LockFundsDto } from '@/common/dto/wallet/LockFunds.dto';
import { WalletResponseDto } from '@/common/dto/wallet/res/Wallet.response.dto';
import { WithdrawFundsDto } from '@/common/dto/wallet/WithdrawFunds.dto';
import { UnlockFundsDto } from '@/common/dto/wallet/UnlockFunds.dto';
import { PermanentlyWithdrawLockedFundsDto } from '@/common/dto/wallet/PermanentlyWithdrawLockedFunds.dto';

export const IWalletActionService = Symbol('IWalletActionService');
export interface IWalletActionService {
  depositFunds(dto: DepositFundsDto): Promise<WalletResponseDto>;
  withdrawFunds(dto: WithdrawFundsDto): Promise<WalletResponseDto>;

  lockFunds(dto: LockFundsDto): Promise<WalletResponseDto>;
  unlockFunds(dto: UnlockFundsDto): Promise<WalletResponseDto>;
  permanentlyWithdrawLockedFunds(
    dto: PermanentlyWithdrawLockedFundsDto,
  ): Promise<WalletResponseDto>;
}
