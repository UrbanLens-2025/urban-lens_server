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
import { CreateWithdrawTransactionDto } from '@/common/dto/wallet/CreateWithdrawTransaction.dto';
import { ApproveWithdrawTransactionDto } from '@/common/dto/wallet/ApproveWithdrawTransaction.dto';
import { RejectWithdrawTransactionDto } from '@/common/dto/wallet/RejectWithdrawTransaction.dto';
import { CompleteWithdrawTransactionDto } from '@/common/dto/wallet/CompleteWithdrawTransaction.dto';
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
      const externalTransactionRepository =
        WalletExternalTransactionRepository(em);
      const externalTransactionTimelineRepository =
        WalletExternalTransactionTimelineRepository(em);

      // check if user has exceeded max pending deposit transactions
      const pendingCount = await externalTransactionRepository.count({
        where: {
          walletId: dto.accountId,
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
          walletId: dto.accountId,
          amount: dto.amount,
          currency: dto.currency,
          createdById: dto.accountId,
        });

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

            await externalTransactionRepository.update(
              {
                id: transaction.id,
              },
              transaction,
            );
          } catch (error) {
            throw new InternalServerErrorException(
              'Failed to create payment',
              error as Error,
            );
          }

          return transaction;
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
            note: `Payment confirmation failed: ${confirmationResponse.errorMessage ?? 'Unknown error'}`,
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

      return updateResult;
    });
  }

  createWithdrawTransaction(
    dto: CreateWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto> {
    throw new Error('Method not implemented.');
  }

  approveWithdrawTransaction(
    dto: ApproveWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto> {
    throw new Error('Method not implemented.');
  }

  rejectWithdrawTransaction(
    dto: RejectWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto> {
    throw new Error('Method not implemented.');
  }

  completeWithdrawTransaction(
    dto: CompleteWithdrawTransactionDto,
  ): Promise<WalletExternalTransactionResponseDto> {
    throw new Error('Method not implemented.');
  }
}
