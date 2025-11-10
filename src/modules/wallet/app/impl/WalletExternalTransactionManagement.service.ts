import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IWalletExternalTransactionManagementService } from '@/modules/wallet/app/IWalletExternalTransactionManagement.service';
import { CreateDepositTransactionDto } from '@/common/dto/wallet/CreateDepositTransaction.dto';
import { WalletExternalTransactionResponseDto } from '@/common/dto/wallet/res/WalletExternalTransaction.response.dto';
import { IPaymentGatewayPort } from '@/modules/wallet/app/ports/IPaymentGateway.port';
import { WalletExternalTransactionEntity } from '@/modules/wallet/domain/WalletExternalTransaction.entity';
import { WalletExternalTransactionDirection } from '@/common/constants/WalletExternalTransactionDirection.constant';
import { WalletExternalTransactionRepository } from '@/modules/wallet/infra/repository/WalletExternalTransaction.repository';
import { WalletExternalTransactionStatus } from '@/common/constants/WalletExternalTransactionStatus.constant';
import { ConfirmDepositTransactionDto } from '@/common/dto/wallet/ConfirmDepositTransaction.dto';
import { In, UpdateResult } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';
import { IWalletActionService } from '@/modules/wallet/app/IWalletAction.service';
import { WalletExternalTransactionTimelineRepository } from '@/modules/wallet/infra/repository/WalletExternalTransactionTimeline.repository';
import { WalletExternalTransactionAction } from '@/common/constants/WalletExternalTransactionAction.constant';
import { WalletExternalTransactionActor } from '@/common/constants/WalletExternalTransactionActor.constant';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  WALLET_DEPOSIT_CONFIRMED,
  WalletDepositConfirmedEvent,
} from '@/modules/wallet/domain/events/WalletDepositConfirmed.event';
import { CreateWithdrawTransactionDto } from '@/common/dto/wallet/CreateWithdrawTransaction.dto';
import { StartProcessingWithdrawTransactionDto } from '@/common/dto/wallet/StartProcessingWithdrawTransaction.dto';
import { CompleteProcessingWithdrawTransactionDto } from '@/common/dto/wallet/CompleteProcessingWithdrawTransaction.dto';
import { MarkTransferFailedDto } from '@/common/dto/wallet/MarkTransferFailed.dto';
import { RejectWithdrawTransactionDto } from '@/common/dto/wallet/RejectWithdrawTransaction.dto';
import { CancelWithdrawTransactionDto } from '@/common/dto/wallet/CancelWithdrawTransaction.dto';

@Injectable()
export class WalletExternalTransactionManagementService
  extends CoreService
  implements IWalletExternalTransactionManagementService
{
  private readonly logger = new Logger(
    WalletExternalTransactionManagementService.name,
  );

  private readonly MAX_PENDING_DEPOSIT_TRANSACTIONS: number;
  private readonly PAYMENT_EXPIRATION_MINUTES: number;

  constructor(
    private readonly configService: ConfigService<Environment>,
    @Inject(IPaymentGatewayPort)
    private readonly paymentGatewayPort: IPaymentGatewayPort,
    @Inject(IWalletActionService)
    private readonly walletActionService: IWalletActionService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
    this.MAX_PENDING_DEPOSIT_TRANSACTIONS =
      this.configService.getOrThrow<number>('MAX_PENDING_DEPOSIT_TRANSACTIONS');
    this.PAYMENT_EXPIRATION_MINUTES = this.configService.getOrThrow<number>(
      'PAYMENT_EXPIRATION_MINUTES',
    );
  }

  createDepositTransaction(
    dto: CreateDepositTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const walletRepository = WalletRepository(em);
      const externalTransactionRepository =
        WalletExternalTransactionRepository(em);
      const externalTransactionTimelineRepository =
        WalletExternalTransactionTimelineRepository(em);

      // Fetch wallet by ownedBy (account ID)
      const wallet = await walletRepository.findByOwnedBy({
        ownedBy: dto.accountId,
      });

      // check if user has exceeded max pending deposit transactions
      const pendingCount = await externalTransactionRepository.count({
        where: {
          walletId: wallet.id,
          direction: WalletExternalTransactionDirection.DEPOSIT,
          status: In([
            WalletExternalTransactionStatus.PENDING,
            WalletExternalTransactionStatus.READY_FOR_PAYMENT,
          ]),
        },
      });
      if (pendingCount >= this.MAX_PENDING_DEPOSIT_TRANSACTIONS) {
        throw new BadRequestException(
          'Exceeded maximum pending deposit transactions',
        );
      }

      // create transaction record
      const externalTransaction =
        WalletExternalTransactionEntity.createDepositTransaction({
          walletId: wallet.id,
          amount: dto.amount,
          currency: dto.currency,
          createdById: dto.accountId,
        });
      externalTransaction.afterFinishAction = dto.afterAction;

      return await externalTransactionRepository
        .save(externalTransaction)
        // TODO: emit event and send delayed message for expired transactions
        // create payment
        .then(async (transaction) => {
          const now = new Date();
          const expiresAt = new Date(
            now.getTime() + this.PAYMENT_EXPIRATION_MINUTES * 60000,
          );

          try {
            const paymentDetails =
              await this.paymentGatewayPort.createPaymentUrl({
                transactionId: transaction.id,
                currency: dto.currency,
                amount: dto.amount,
                ipAddress: dto.ipAddress,
                returnUrl: dto.returnUrl,
                expiresAt: expiresAt,
              });

            transaction.addPayment({
              paymentUrl: paymentDetails.paymentUrl,
              expiresAt,
              provider: paymentDetails.provider,
            });

            return externalTransactionRepository.save(transaction);
          } catch (error) {
            throw new InternalServerErrorException(
              'Failed to create payment',
              error as Error,
            );
          }
        })
        // record auditing timeline
        .then(async (transaction) => {
          await externalTransactionTimelineRepository.save(
            externalTransactionTimelineRepository.create({
              transactionId: transaction.id,
              action:
                WalletExternalTransactionAction.CREATE_DEPOSIT_TRANSACTION,
              actorType: WalletExternalTransactionActor.PRIVATE_USER,
              actorId: dto.accountId,
              actorName: dto.accountName,
              statusChangedTo:
                WalletExternalTransactionStatus.READY_FOR_PAYMENT,
              note: `Created deposit transaction and initiated payment with ${transaction.provider}`,
            }),
          );
          return transaction;
        })
        // map to dto
        .then((transaction) =>
          this.mapTo(WalletExternalTransactionResponseDto, transaction),
        );
    });
  }

  confirmDepositTransaction(
    dto: ConfirmDepositTransactionDto,
  ): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const confirmationResponse =
        this.paymentGatewayPort.processPaymentConfirmation(dto.queryParams);
      const externalTransactionTimelineRepository =
        WalletExternalTransactionTimelineRepository(em);

      if (!confirmationResponse.transactionId) {
        throw new BadRequestException(
          'Missing transaction ID in payment confirmation',
        );
      }

      if (!confirmationResponse.success) {
        this.logger.error('Payment confirmation failed');
        await externalTransactionTimelineRepository.save(
          externalTransactionTimelineRepository.create({
            transactionId: confirmationResponse.transactionId,
            action: WalletExternalTransactionAction.CONFIRM_DEPOSIT_TRANSACTION,
            actorType: WalletExternalTransactionActor.EXTERNAL_SYSTEM,
            actorName: 'PaymentGateway',
            statusChangedTo: WalletExternalTransactionStatus.FAILED,
            note: `Payment gateway reported failure during payment confirmation`,
            metadata: confirmationResponse.rawResponse,
          }),
        );
        throw new InternalServerErrorException('Payment confirmation failed');
      }

      const externalTransactionRepository =
        WalletExternalTransactionRepository(em);

      const transaction = await externalTransactionRepository.findOne({
        where: {
          id: confirmationResponse.transactionId,
          direction: WalletExternalTransactionDirection.DEPOSIT,
          status: WalletExternalTransactionStatus.READY_FOR_PAYMENT,
        },
      });

      // validate: transaction exists
      if (!transaction) {
        throw new BadRequestException('Deposit transaction not found');
      }

      // validate: not expired
      const now = new Date();
      if (transaction.expiresAt && transaction.expiresAt < now) {
        throw new BadRequestException('Deposit transaction has expired');
      }

      transaction.confirmPayment({
        providerTransactionId: confirmationResponse.providerTransactionId,
        providerResponse: confirmationResponse.rawResponse,
      });

      const updateResult = await externalTransactionRepository.update(
        {
          id: transaction.id,
        },
        transaction,
      );

      if (updateResult.affected === 0) {
        throw new InternalServerErrorException(
          'Failed to update deposit transaction status',
        );
      }

      await externalTransactionTimelineRepository.save(
        externalTransactionTimelineRepository.create({
          transactionId: transaction.id,
          action: WalletExternalTransactionAction.CONFIRM_DEPOSIT_TRANSACTION,
          actorType: WalletExternalTransactionActor.EXTERNAL_SYSTEM,
          actorName: transaction.provider ?? 'Unknown',
          statusChangedTo: WalletExternalTransactionStatus.COMPLETED,
          note: `Received payment notification from ${transaction.provider}`,
          metadata: confirmationResponse.rawResponse,
        }),
      );

      const updatedWallet = await this.walletActionService.depositFunds({
        entityManager: em,
        walletId: transaction.walletId,
        amount: confirmationResponse.amount,
        currency: transaction.currency,
      });

      await externalTransactionTimelineRepository.save(
        externalTransactionTimelineRepository.create({
          transactionId: transaction.id,
          action: WalletExternalTransactionAction.ADD_BALANCE_AFTER_DEPOSIT,
          actorType: WalletExternalTransactionActor.SYSTEM,
          actorName: 'SYSTEM',
          statusChangedTo: WalletExternalTransactionStatus.COMPLETED,
          note: `Balance updated after deposit transaction`,
          metadata: updatedWallet,
        }),
      );

      this.logger.log(`Deposit transaction confirmed: ${transaction.id}`);

      // Fetch wallet entity for event
      const walletRepository = WalletRepository(em);
      const walletEntity = await walletRepository.findOne({
        where: { id: transaction.walletId },
      });

      // Emit deposit confirmed event
      if (walletEntity) {
        const depositConfirmedEvent = new WalletDepositConfirmedEvent();
        depositConfirmedEvent.transaction = transaction;
        depositConfirmedEvent.wallet = walletEntity;
        depositConfirmedEvent.accountId = transaction.createdById;
        this.eventEmitter.emit(WALLET_DEPOSIT_CONFIRMED, depositConfirmedEvent);
      }

      this.logger.debug('Processing after action for deposit transaction');

      return updateResult;
    });
  }

  createWithdrawTransaction(
    dto: CreateWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const walletRepository = WalletRepository(em);
      const externalTransactionRepository =
        WalletExternalTransactionRepository(em);
      const externalTransactionTimelineRepository =
        WalletExternalTransactionTimelineRepository(em);

      const wallet = await walletRepository
        .findByOwnedBy({
          ownedBy: dto.accountId,
        })
        .then((wal) => {
          if (wal.balance < dto.amountToWithdraw) {
            throw new BadRequestException('Insufficient wallet balance');
          }
          return wal;
        })
        .then((wal) => {
          if (!wal.canUpdateBalance()) {
            throw new BadRequestException(
              'Wallet balance cannot be updated at this time',
            );
          }
          return wal;
        });

      const externalTransaction =
        WalletExternalTransactionEntity.createWithdrawTransaction({
          walletId: wallet.id,
          createdById: dto.accountId,
          amount: dto.amountToWithdraw,
          currency: dto.currency,
        });

      return await externalTransactionRepository
        .save(externalTransaction)
        // lock funds in wallet
        .then(async (transaction) => {
          await this.walletActionService.lockFunds({
            amount: dto.amountToWithdraw,
            walletId: wallet.id,
            entityManager: em,
            currency: dto.currency,
          });

          return transaction;
        })
        // record auditing timeline
        .then(async (transaction) => {
          await externalTransactionTimelineRepository.save(
            externalTransactionTimelineRepository.create({
              transactionId: transaction.id,
              action:
                WalletExternalTransactionAction.CREATE_WITHDRAW_AND_LOCK_FUNDS,
              actorType: WalletExternalTransactionActor.PRIVATE_USER,
              actorId: dto.accountId,
              actorName: dto.accountName,
              statusChangedTo: WalletExternalTransactionStatus.PENDING,
              note: 'Created withdraw transaction and locked funds in wallet',
            }),
          );
          return transaction;
        })
        // map to dto
        .then((res) => this.mapTo(WalletExternalTransactionResponseDto, res));
    });
  }

  startProcessingWithdrawTransaction(
    dto: StartProcessingWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const externalTransactionRepository =
        WalletExternalTransactionRepository(em);
      const externalTransactionTimelineRepository =
        WalletExternalTransactionTimelineRepository(em);

      // Atomic update: only update if status is PENDING
      const updateResult = await externalTransactionRepository.update(
        {
          id: dto.transactionId,
          status: WalletExternalTransactionStatus.PENDING,
        },
        {
          status: WalletExternalTransactionStatus.PROCESSING,
        },
      );

      if (updateResult.affected === 0) {
        throw new BadRequestException(
          'Transaction is no longer PENDING. It may have been cancelled or already processed.',
        );
      }

      const transaction = await externalTransactionRepository.findOneOrFail({
        where: {
          id: dto.transactionId,
        },
      });

      // Record timeline
      await externalTransactionTimelineRepository.save(
        externalTransactionTimelineRepository.create({
          transactionId: transaction.id,
          action:
            WalletExternalTransactionAction.START_PROCESSING_WITHDRAW_TRANSACTION,
          actorType: WalletExternalTransactionActor.ADMIN,
          actorId: dto.accountId,
          actorName: dto.accountName,
          statusChangedTo: WalletExternalTransactionStatus.PROCESSING,
          note: `Started processing withdraw transaction`,
        }),
      );

      return this.mapTo(WalletExternalTransactionResponseDto, transaction);
    });
  }

  completeProcessingWithdrawTransaction(
    dto: CompleteProcessingWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const externalTransactionRepository =
        WalletExternalTransactionRepository(em);
      const externalTransactionTimelineRepository =
        WalletExternalTransactionTimelineRepository(em);

      // Atomic update: only update if status is PROCESSING
      const transaction = await externalTransactionRepository.findOne({
        where: {
          id: dto.transactionId,
          status: WalletExternalTransactionStatus.PROCESSING,
        },
      });

      if (!transaction) {
        throw new BadRequestException(
          'Transaction is not in PROCESSING status. It may have been cancelled or already completed.',
        );
      }

      if (!transaction.canCompleteProcessing()) {
        throw new BadRequestException(
          'You are not allowed to complete this withdraw transaction',
        );
      }

      transaction.completeProcessing();

      await externalTransactionRepository.save(transaction);

      // Permanently remove locked funds
      await this.walletActionService.permanentlyWithdrawLockedFunds({
        entityManager: em,
        walletId: transaction.walletId,
        amount: transaction.amount,
        currency: transaction.currency,
      });

      // Record timeline
      await externalTransactionTimelineRepository.save(
        externalTransactionTimelineRepository.create({
          transactionId: transaction.id,
          action:
            WalletExternalTransactionAction.COMPLETE_PROCESSING_WITHDRAW_TRANSACTION,
          actorType: WalletExternalTransactionActor.ADMIN,
          actorId: dto.accountId,
          actorName: dto.accountName,
          statusChangedTo: WalletExternalTransactionStatus.TRANSFERRED,
          note: `Completed processing withdraw transaction. Funds permanently removed.`,
        }),
      );

      return this.mapTo(WalletExternalTransactionResponseDto, transaction);
    });
  }

  markTransferFailed(
    dto: MarkTransferFailedDto,
  ): Promise<WalletExternalTransactionResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const externalTransactionRepository =
        WalletExternalTransactionRepository(em);
      const externalTransactionTimelineRepository =
        WalletExternalTransactionTimelineRepository(em);

      // Atomic update: only update if status is PROCESSING
      const transaction = await externalTransactionRepository.findOne({
        where: {
          id: dto.transactionId,
          status: WalletExternalTransactionStatus.PROCESSING,
        },
      });

      if (!transaction) {
        throw new BadRequestException(
          'Transaction is not in PROCESSING status. It may have been cancelled or already completed.',
        );
      }

      if (!transaction.canMarkTransferFailed()) {
        throw new BadRequestException(
          'You are not allowed to mark this transaction as transfer failed',
        );
      }

      transaction.markTransferFailed();

      await externalTransactionRepository.save(transaction);

      // Unlock funds since transfer failed
      await this.walletActionService.unlockFunds({
        entityManager: em,
        walletId: transaction.walletId,
        amount: transaction.amount,
        currency: transaction.currency,
      });

      // Record timeline
      await externalTransactionTimelineRepository.save(
        externalTransactionTimelineRepository.create({
          transactionId: transaction.id,
          action: WalletExternalTransactionAction.MARK_TRANSFER_FAILED,
          actorType: WalletExternalTransactionActor.ADMIN,
          actorId: dto.accountId,
          actorName: dto.accountName,
          statusChangedTo: WalletExternalTransactionStatus.TRANSFER_FAILED,
          note: `Transfer failed. Reason: ${dto.failureReason}. Funds unlocked.`,
        }),
      );

      return this.mapTo(WalletExternalTransactionResponseDto, transaction);
    });
  }

  rejectWithdrawTransaction(
    dto: RejectWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const externalTransactionRepository =
        WalletExternalTransactionRepository(em);
      const externalTransactionTimelineRepository =
        WalletExternalTransactionTimelineRepository(em);

      // Atomic update: only update if status is PENDING
      const updateResult = await externalTransactionRepository.update(
        {
          id: dto.transactionId,
          status: WalletExternalTransactionStatus.PENDING,
        },
        {
          status: WalletExternalTransactionStatus.REJECTED,
        },
      );

      if (updateResult.affected === 0) {
        throw new BadRequestException(
          'Transaction is no longer PENDING. It may have been cancelled or already processed.',
        );
      }

      const transaction = await externalTransactionRepository.findOneOrFail({
        where: {
          id: dto.transactionId,
        },
      });

      // Unlock funds
      await this.walletActionService.unlockFunds({
        entityManager: em,
        walletId: transaction.walletId,
        amount: transaction.amount,
        currency: transaction.currency,
      });

      // Record timeline
      await externalTransactionTimelineRepository.save(
        externalTransactionTimelineRepository.create({
          transactionId: transaction.id,
          action: WalletExternalTransactionAction.REJECT_WITHDRAW_TRANSACTION,
          actorType: WalletExternalTransactionActor.ADMIN,
          actorId: dto.accountId,
          actorName: dto.accountName,
          statusChangedTo: WalletExternalTransactionStatus.REJECTED,
          note: `Rejected withdraw transaction. Reason: ${dto.rejectionReason}`,
        }),
      );

      return this.mapTo(WalletExternalTransactionResponseDto, transaction);
    });
  }

  cancelWithdrawTransaction(
    dto: CancelWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const externalTransactionRepository =
        WalletExternalTransactionRepository(em);
      const externalTransactionTimelineRepository =
        WalletExternalTransactionTimelineRepository(em);

      // Atomic update: only update if status is PENDING and createdById matches
      const updateResult = await externalTransactionRepository.update(
        {
          id: dto.transactionId,
          status: WalletExternalTransactionStatus.PENDING,
          createdById: dto.accountId,
        },
        {
          status: WalletExternalTransactionStatus.CANCELLED,
        },
      );

      if (updateResult.affected === 0) {
        throw new BadRequestException(
          'Cannot cancel: transaction is being processed, already finalized, or you are not the owner.',
        );
      }

      const transaction = await externalTransactionRepository.findOneOrFail({
        where: {
          id: dto.transactionId,
        },
      });

      // Unlock funds
      await this.walletActionService.unlockFunds({
        entityManager: em,
        walletId: transaction.walletId,
        amount: transaction.amount,
        currency: transaction.currency,
      });

      // Record timeline
      await externalTransactionTimelineRepository.save(
        externalTransactionTimelineRepository.create({
          transactionId: transaction.id,
          action: WalletExternalTransactionAction.CANCEL_WITHDRAW_TRANSACTION,
          actorType: WalletExternalTransactionActor.PRIVATE_USER,
          actorId: dto.accountId,
          actorName: dto.accountName,
          statusChangedTo: WalletExternalTransactionStatus.CANCELLED,
          note: `Cancelled withdraw transaction. Funds unlocked.`,
        }),
      );

      return this.mapTo(WalletExternalTransactionResponseDto, transaction);
    });
  }
}
