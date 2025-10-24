import { Module } from '@nestjs/common';
import { WalletInfraModule } from '@/modules/wallet/infra/Wallet.infra.module';
import { IWalletManagementService } from '@/modules/wallet/app/IWalletManagement.service';
import { WalletManagementService } from '@/modules/wallet/app/impl/WalletManagement.service';
import { IWalletTransactionQueryService } from '@/modules/wallet/app/IWalletTransactionQuery.service';
import { WalletTransactionQueryService } from '@/modules/wallet/app/impl/WalletTransactionQuery.service';
import { IWalletTransactionManagementService } from '@/modules/wallet/app/IWalletTransactionManagement.service';
import { WalletTransactionManagementService } from '@/modules/wallet/app/impl/WalletTransactionManagement.service';
import { IWalletExternalTransactionQueryService } from '@/modules/wallet/app/IWalletExternalTransactionQuery.service';
import { WalletExternalTransactionQueryService } from '@/modules/wallet/app/impl/WalletExternalTransactionQuery.service';
import { IWalletExternalTransactionManagementService } from '@/modules/wallet/app/IWalletExternalTransactionManagement.service';
import { WalletExternalTransactionManagementService } from '@/modules/wallet/app/impl/WalletExternalTransactionManagement.service';
import { WalletCreationListener } from '@/modules/wallet/app/listeners/WalletCreation.listener';
import { WalletPrivateController } from '@/modules/wallet/interfaces/Wallet.private.controller';
import { IPaymentGatewayPort } from '@/modules/wallet/app/ports/IPaymentGateway.port';
import { VNPayPaymentGatewayAdapter } from '@/modules/wallet/infra/adapter/VNPayPaymentGateway.adapter';

@Module({
  imports: [WalletInfraModule],
  controllers: [WalletPrivateController],
  providers: [
    {
      provide: IWalletManagementService,
      useClass: WalletManagementService,
    },
    {
      provide: IWalletTransactionQueryService,
      useClass: WalletTransactionQueryService,
    },
    {
      provide: IWalletTransactionManagementService,
      useClass: WalletTransactionManagementService,
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
    WalletCreationListener,
  ],
  exports: [WalletInfraModule],
})
export class WalletModule {}
