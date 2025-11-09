import { InitiateTransferFromEscrowToAccountDto } from '@/common/dto/wallet/InitiateTransferFromEscrowToAccount.dto';
import { InitiateTransferFromEscrowToSystemDto } from '@/common/dto/wallet/InitiateTransferFromEscrowToSystem.dto';
import { InitiateTransferToEscrowDto } from '@/common/dto/wallet/InitiateTransferToEscrow.dto';
import { WalletTransactionResponseDto } from '@/common/dto/wallet/res/WalletTransaction.response.dto';

export const IWalletTransactionCoordinatorService = Symbol(
  'IWalletTransactionCoordinatorService',
);

export interface IWalletTransactionCoordinatorService {
  coordinateTransferToEscrow(
    dto: InitiateTransferToEscrowDto,
  ): Promise<WalletTransactionResponseDto>;

  transferFromEscrowToSystem(
    dto: InitiateTransferFromEscrowToSystemDto,
  ): Promise<WalletTransactionResponseDto>;

  transferFromEscrowToAccount(
    dto: InitiateTransferFromEscrowToAccountDto,
  ): Promise<WalletTransactionResponseDto>;
}
