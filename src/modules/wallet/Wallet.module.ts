import { Module } from '@nestjs/common';
import { WalletInfraModule } from '@/modules/wallet/infra/Wallet.infra.module';
import { IWalletQueryService } from '@/modules/wallet/app/IWalletQuery.service';
import { WalletQueryService } from '@/modules/wallet/app/impl/WalletQuery.service';
import { IWalletExternalTransactionQueryService } from '@/modules/wallet/app/IWalletExternalTransactionQuery.service';
import { WalletExternalTransactionQueryService } from '@/modules/wallet/app/impl/WalletExternalTransactionQuery.service';
import { IWalletExternalTransactionManagementService } from '@/modules/wallet/app/IWalletExternalTransactionManagement.service';
import { WalletExternalTransactionManagementService } from '@/modules/wallet/app/impl/WalletExternalTransactionManagement.service';
import { WalletCreationListener } from '@/modules/wallet/app/listeners/WalletCreation.listener';
import { WalletPrivateController } from '@/modules/wallet/interfaces/Wallet.private.controller';
import { IPaymentGatewayPort } from '@/modules/wallet/app/ports/IPaymentGateway.port';
import { VNPayPaymentGatewayAdapter } from '@/modules/wallet/infra/adapter/VNPayPaymentGateway.adapter';
import { WalletDevOnlyController } from '@/modules/wallet/interfaces/Wallet.dev-only.controller';
import { WalletExternalTransactionWebhook } from '@/modules/wallet/interfaces/webhooks/WalletExternalTransaction.webhook';
import { IWalletActionService } from '@/modules/wallet/app/IWalletAction.service';
import { WalletActionService } from '@/modules/wallet/app/impl/WalletAction.service';
import { WalletSeederHelper } from '@/modules/wallet/app/helper/WalletSeeder.helper';
import { IWalletTransactionHandlerService } from '@/modules/wallet/app/IWalletTransactionHandler.service';
import { WalletTransactionHandlerService } from '@/modules/wallet/app/impl/WalletTransactionHandler.service';
import { WalletAdminController } from '@/modules/wallet/interfaces/Wallet.admin.controller';

@Module({
  imports: [WalletInfraModule],
  controllers: [
    WalletPrivateController,
    WalletDevOnlyController,
    WalletExternalTransactionWebhook,
    WalletAdminController,
  ],
  providers: [
    {
      provide: IWalletQueryService,
      useClass: WalletQueryService,
    },
    {
      provide: IWalletActionService,
      useClass: WalletActionService,
    },
    {
      provide: IWalletExternalTransactionQueryService,
      useClass: WalletExternalTransactionQueryService,
    },
    {
      provide: IWalletExternalTransactionManagementService,
      useClass: WalletExternalTransactionManagementService,
    },
    {
      provide: IPaymentGatewayPort,
      useClass: VNPayPaymentGatewayAdapter,
    },
    {
      provide: IWalletTransactionHandlerService,
      useClass: WalletTransactionHandlerService,
    },
    WalletCreationListener,
    WalletSeederHelper,
  ],
  exports: [WalletInfraModule],
})
export class WalletModule {}
