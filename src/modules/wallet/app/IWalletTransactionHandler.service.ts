import { TransferFundsToEscrowDto } from '@/common/dto/wallet/TransferFundsToEscrow.dto';

export const IWalletTransactionHandlerService = Symbol(
  'IWalletTransactionHandlerService',
);
export interface IWalletTransactionHandlerService {
  transferFunds_toSystem(dto: TransferFundsToEscrowDto): Promise<void>;
}
