import { Module } from '@nestjs/common';
import { WalletInfraModule } from '@/modules/wallet/infra/Wallet.infra.module';
import { IWalletQueryService } from '@/modules/wallet/app/IWalletQuery.service';
import { WalletQueryService } from '@/modules/wallet/app/impl/WalletQuery.service';
import { IWalletExternalTransactionQueryService } from '@/modules/wallet/app/IWalletExternalTransactionQuery.service';
import { WalletExternalTransactionQueryService } from '@/modules/wallet/app/impl/WalletExternalTransactionQuery.service';
import { IWalletExternalTransactionManagementService } from '@/modules/wallet/app/IWalletExternalTransactionManagement.service';
import { WalletExternalTransactionManagementService } from '@/modules/wallet/app/impl/WalletExternalTransactionManagement.service';
import { WalletPrivateController } from '@/modules/wallet/interfaces/Wallet.private.controller';
import { IPaymentGatewayPort } from '@/modules/wallet/app/ports/IPaymentGateway.port';
import { WalletDevOnlyController } from '@/modules/wallet/interfaces/Wallet.dev-only.controller';
import { WalletExternalTransactionWebhook } from '@/modules/wallet/interfaces/webhooks/WalletExternalTransaction.webhook';
import { IWalletActionService } from '@/modules/wallet/app/IWalletAction.service';
import { WalletActionService } from '@/modules/wallet/app/impl/WalletAction.service';
import { WalletSeederHelper } from '@/modules/wallet/app/helper/WalletSeeder.helper';
import { IWalletTransactionManagementService } from '@/modules/wallet/app/IWalletTransactionManagement.service';
import { WalletTransactionManagementService } from '@/modules/wallet/app/impl/WalletTransactionManagement.service';
import { WalletAdminController } from '@/modules/wallet/interfaces/Wallet.admin.controller';
import { IWalletTransactionCoordinatorService } from '@/modules/wallet/app/IWalletTransactionCoordinator.service';
import { WalletTransactionCoordinatorService } from '@/modules/wallet/app/impl/WalletTransactionCoordinator.service';
import { IWalletTransactionQueryService } from '@/modules/wallet/app/IWalletTransactionQuery.service';
import { WalletTransactionQueryService } from '@/modules/wallet/app/impl/WalletTransactionQuery.service';
import { SEPayPaymentGatewayAdapter } from '@/modules/wallet/infra/adapter/SEPayPaymentGateway.adapter';

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
      useClass: SEPayPaymentGatewayAdapter,
    },
    {
      provide: IWalletTransactionManagementService,
      useClass: WalletTransactionManagementService,
    },
    {
      provide: IWalletTransactionCoordinatorService,
      useClass: WalletTransactionCoordinatorService,
    },
    {
      provide: IWalletTransactionQueryService,
      useClass: WalletTransactionQueryService,
    },
    WalletSeederHelper,
  ],
  exports: [WalletInfraModule, IWalletTransactionCoordinatorService],
})
export class WalletModule {}
