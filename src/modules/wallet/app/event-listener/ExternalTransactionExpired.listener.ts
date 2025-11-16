import {
  DelayedMessageKeys,
  DelayedMessagePayload,
} from '@/common/constants/DelayedMessageKeys.constant';
import { WalletExternalTransactionStatus } from '@/common/constants/WalletExternalTransactionStatus.constant';
import { CoreService } from '@/common/core/Core.service';
import { DelayedMessageResponseWrapper } from '@/common/core/delayed-message/DelayedMessageResponseWrapper';
import { WalletExternalTransactionRepository } from '@/modules/wallet/infra/repository/WalletExternalTransaction.repository';
import { OnEvent } from '@nestjs/event-emitter';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ExternalTransactionExpiredListener extends CoreService {
  private readonly logger = new Logger(ExternalTransactionExpiredListener.name);
  @OnEvent(DelayedMessageKeys.TRANSACTION_EXPIRED)
  async handleEvent(
    event: DelayedMessageResponseWrapper<
      DelayedMessagePayload<DelayedMessageKeys.TRANSACTION_EXPIRED>
    >,
  ) {
    const { transactionId } = event.content;

    return this.ensureTransaction(null, async (em) => {
      this.logger.verbose(
        `Handling external transaction expired event for transaction ${transactionId}`,
      );
      try {
        const externalTransactionRepository =
          WalletExternalTransactionRepository(em);

        const transaction = await externalTransactionRepository.findOneOrFail({
          where: {
            id: transactionId,
          },
        });

        if (
          transaction.status ===
          WalletExternalTransactionStatus.READY_FOR_PAYMENT
        ) {
          transaction.markAsExpired();

          await externalTransactionRepository.save(transaction);
        }

        event.ack();

        return;
      } catch (error) {
        event.nack();
        this.logger.error(
          'Error handling external transaction expired event',
          error,
        );
        return;
      }
    });
  }
}
