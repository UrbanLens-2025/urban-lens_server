import { CoreService } from '@/common/core/Core.service';
import { DepositFundsDto } from '@/common/dto/wallet/DepositFunds.dto';
import { IWalletActionService } from '@/modules/wallet/app/IWalletAction.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';
import { WalletResponseDto } from '@/common/dto/wallet/res/Wallet.response.dto';
import { WithdrawFundsDto } from '@/common/dto/wallet/WithdrawFunds.dto';
import { LockFundsDto } from '@/common/dto/wallet/LockFunds.dto';
import { UnlockFundsDto } from '@/common/dto/wallet/UnlockFunds.dto';
import { PermanentlyWithdrawLockedFundsDto } from '@/common/dto/wallet/PermanentlyWithdrawLockedFunds.dto';

@Injectable()
export class WalletActionService
  extends CoreService
  implements IWalletActionService
{
  private readonly logger = super.getLogger(WalletActionService.name);

  constructor() {
    super();
  }

  depositFunds(rawDto: DepositFundsDto): Promise<WalletResponseDto> {
    return this.ensureTransaction(rawDto.entityManager, async (em) => {
      const dto = rawDto;

      this.logger.verbose(
        `Depositing ${dto.amount} ${dto.currency} to wallet ${dto.walletId}`,
      );

      const walletRepository = WalletRepository(em);

      const wallet = await walletRepository
        .findOneOrFail({
          where: {
            id: dto.walletId,
          },
        })
        .then(function checkCanUpdate(wal) {
          if (!wal.canUpdateBalance()) {
            throw new BadRequestException('Wallet cannot update balance');
          }
          return wal;
        })
        .then(function checkCurrency(wal) {
          if (dto.currency !== wal.currency) {
            throw new BadRequestException(
              `Currency mismatch: wallet currency is ${String(wal.currency)}, but deposit currency is ${String(dto.currency)}`,
            );
          }
          return wal;
        });

      wallet.balance = await walletRepository.incrementBalance({
        walletId: wallet.id,
        amount: dto.amount,
      });

      this.logger.verbose('Deposit successful to wallet: ' + dto.walletId);

      return this.mapTo(WalletResponseDto, wallet);
    });
  }

  withdrawFunds(rawDto: WithdrawFundsDto): Promise<WalletResponseDto> {
    return this.ensureTransaction(rawDto.entityManager, async (em) => {
      const dto = rawDto;

      this.logger.verbose(
        `Withdrawing ${dto.amount} ${dto.currency} from wallet ${dto.walletId}`,
      );

      const walletRepository = WalletRepository(em);

      const wallet = await walletRepository
        .findOneOrFail({
          where: {
            id: dto.walletId,
          },
        })
        .then(function checkCanUpdate(wal) {
          if (!wal.canUpdateBalance()) {
            throw new BadRequestException('Wallet cannot update balance');
          }
          return wal;
        })
        .then(function checkCurrency(wal) {
          if (dto.currency !== wal.currency) {
            throw new BadRequestException(
              `Currency mismatch: wallet currency is ${String(wal.currency)}, but withdraw currency is ${String(dto.currency)}`,
            );
          }
          return wal;
        })
        .then(function checkSufficientFunds(wal) {
          if (wal.balance < dto.amount) {
            throw new BadRequestException('Insufficient funds in wallet');
          }
          return wal;
        });

      wallet.balance = await walletRepository.decrementBalance({
        walletId: wallet.id,
        amount: dto.amount,
      });

      this.logger.verbose('Withdrawal successful from wallet: ' + dto.walletId);

      return this.mapTo(WalletResponseDto, wallet);
    });
  }

  lockFunds(rawDto: LockFundsDto): Promise<WalletResponseDto> {
    return this.ensureTransaction(rawDto.entityManager, async (em) => {
      const dto = rawDto;

      this.logger.verbose(
        `Locking ${dto.amount} ${dto.currency} in wallet ${dto.walletId}`,
      );

      const walletRepository = WalletRepository(em);

      const wallet = await walletRepository
        .findOneOrFail({
          where: {
            id: dto.walletId,
          },
        })
        .then(function checkCanUpdate(wal) {
          if (!wal.canUpdateBalance()) {
            throw new BadRequestException('Wallet cannot update balance');
          }
          return wal;
        })
        .then(function checkCurrency(wal) {
          if (dto.currency !== wal.currency) {
            throw new BadRequestException(
              `Currency mismatch: wallet currency is ${String(wal.currency)}, but withdraw currency is ${String(dto.currency)}`,
            );
          }
          return wal;
        })
        .then(function checkSufficientFunds(wal) {
          if (wal.balance < dto.amount) {
            throw new BadRequestException('Insufficient funds in wallet');
          }
          return wal;
        });

      wallet.balance = await walletRepository.incrementLockedBalance({
        walletId: wallet.id,
        amount: dto.amount,
      });

      this.logger.verbose('Funds locked in wallet: ' + dto.walletId);

      return this.mapTo(WalletResponseDto, wallet);
    });
  }

  unlockFunds(rawDto: UnlockFundsDto): Promise<WalletResponseDto> {
    return this.ensureTransaction(rawDto.entityManager, async (em) => {
      const dto = rawDto;

      this.logger.verbose(
        `Unlocking ${dto.amount} ${dto.currency} in wallet ${dto.walletId}`,
      );

      const walletRepository = WalletRepository(em);

      const wallet = await walletRepository
        .findOneOrFail({
          where: {
            id: dto.walletId,
          },
        })
        .then(function checkCanUpdate(wal) {
          if (!wal.canUpdateBalance()) {
            throw new BadRequestException('Wallet cannot update balance');
          }
          return wal;
        })
        .then(function checkCurrency(wal) {
          if (dto.currency !== wal.currency) {
            throw new BadRequestException(
              `Currency mismatch: wallet currency is ${String(wal.currency)}, but unlock currency is ${String(dto.currency)}`,
            );
          }
          return wal;
        })
        .then(function checkSufficientLockedFunds(wal) {
          if (wal.lockedBalance < dto.amount) {
            throw new BadRequestException(
              'Insufficient locked funds in wallet',
            );
          }
          return wal;
        });

      const result = await walletRepository.decrementLockedBalance({
        walletId: wallet.id,
        amount: dto.amount,
      });

      wallet.balance = result.balance;
      wallet.lockedBalance = result.lockedBalance;

      this.logger.verbose('Funds unlocked in wallet: ' + dto.walletId);

      return this.mapTo(WalletResponseDto, wallet);
    });
  }

  permanentlyWithdrawLockedFunds(
    rawDto: PermanentlyWithdrawLockedFundsDto,
  ): Promise<WalletResponseDto> {
    return this.ensureTransaction(rawDto.entityManager, async (em) => {
      const dto = rawDto;

      this.logger.verbose(
        `Permanently withdrawing ${dto.amount} ${dto.currency} locked funds from wallet ${dto.walletId}`,
      );

      const walletRepository = WalletRepository(em);

      const wallet = await walletRepository
        .findOneOrFail({
          where: {
            id: dto.walletId,
          },
        })
        .then(function checkCanUpdate(wal) {
          if (!wal.canUpdateBalance()) {
            throw new BadRequestException('Wallet cannot update balance');
          }
          return wal;
        })
        .then(function checkCurrency(wal) {
          if (dto.currency !== wal.currency) {
            throw new BadRequestException(
              `Currency mismatch: wallet currency is ${String(wal.currency)}, but withdraw currency is ${String(dto.currency)}`,
            );
          }
          return wal;
        })
        .then(function checkSufficientLockedFunds(wal) {
          if (wal.lockedBalance < dto.amount) {
            throw new BadRequestException(
              'Insufficient locked funds in wallet',
            );
          }
          return wal;
        });

      const updateResult = await walletRepository.permanentlyRemoveLockedFunds({
        walletId: wallet.id,
        amount: dto.amount,
      });

      if (updateResult.affected === 0) {
        throw new BadRequestException(
          'Failed to permanently remove locked funds. Insufficient locked balance or wallet not found.',
        );
      }

      // Fetch updated wallet to get the new locked balance
      const updatedWallet = await walletRepository.findOneOrFail({
        where: {
          id: dto.walletId,
        },
      });

      this.logger.verbose(
        'Locked funds permanently withdrawn from wallet: ' + dto.walletId,
      );

      return this.mapTo(WalletResponseDto, updatedWallet);
    });
  }
}
