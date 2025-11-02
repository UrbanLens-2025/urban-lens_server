import { InitiateTransferToEscrowDto } from '@/common/dto/wallet/InitiateTransferToEscrow.dto';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';

export const IWalletTransactionCoordinatorService = Symbol(
  'IWalletTransactionCoordinatorService',
);

export interface IWalletTransactionCoordinatorService {
  coordinateTransferToEscrow(
    dto: InitiateTransferToEscrowDto,
  ): Promise<WalletTransactionResponseDto>;
}
