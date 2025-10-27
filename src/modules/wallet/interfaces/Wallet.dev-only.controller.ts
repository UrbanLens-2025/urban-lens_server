import { Controller, Get, Inject, Post, Query, Req } from '@nestjs/common';
import { IPaymentGatewayPort } from '@/modules/wallet/app/ports/IPaymentGateway.port';
import { CreatePaymentLinkDto } from '@/common/dto/wallet/CreatePaymentLink.dto';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { type Request } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IWalletExternalTransactionManagementService } from '@/modules/wallet/app/IWalletExternalTransactionManagement.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AccountRepositoryProvider } from '@/modules/account/infra/repository/Account.repository';
import {
  USER_REGISTRATION_CONFIRMED,
  UserRegistrationConfirmedEvent,
} from '@/modules/auth/app/events/UserRegistrationConfirmed.event';
import { Role } from '@/common/constants/Role.constant';
import { DataSource, In } from 'typeorm';
import { WalletRepository } from '@/modules/wallet/infra/repository/Wallet.repository';

@ApiTags('_Development')
@Controller('/dev-only/wallet')
export class WalletDevOnlyController {
  constructor(
    @Inject(IPaymentGatewayPort)
    private readonly paymentGateway: IPaymentGatewayPort,
    @Inject(IWalletExternalTransactionManagementService)
    private readonly walletExternalTransactionManagementService: IWalletExternalTransactionManagementService,
    @Inject(IPaymentGatewayPort)
    private readonly paymentGatewayPort: IPaymentGatewayPort,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {}

  @ApiOperation({ summary: 'Mock confirm payment from VNPay' })
  @Get('/vnpay/mock-confirm-payment')
  mockConfirmPayment(
    @Query('amount') amount: number,
    @Query('vnpay-transaction-number') transactionNo: number,
    @Query('transaction-id') transactionId: string,
  ) {
    return this.walletExternalTransactionManagementService.confirmDepositTransaction(
      {
        queryParams:
          this.paymentGatewayPort.createMockProcessPaymentConfirmationPayload({
            amount,
            transactionNo: transactionNo,
            transactionId,
          }),
      },
    );
  }

  @ApiOperation({ summary: 'Create dummy payment link' })
  @Post('/test-create-payment')
  async testCreatePayment(@Req() req: Request) {
    const dto = new CreatePaymentLinkDto();
    dto.amount = 1000000;
    dto.currency = SupportedCurrency.VND;
    dto.ipAddress = req.ip ?? req.header('X-Forwarded-For') ?? '';
    dto.returnUrl = 'https://google.com';
    dto.bankCode = undefined;
    return this.paymentGateway.createPaymentUrl(dto);
  }

  @ApiOperation({
    summary: 'Seed wallets for all eligible accounts',
    description:
      'Scans all accounts and creates wallets for USER, EVENT_CREATOR, and BUSINESS_OWNER roles by publishing wallet creation events',
  })
  @Post('/seed-wallets-for-accounts')
  async seedWalletsForAccounts() {
    const accountRepository = AccountRepositoryProvider(this.dataSource);
    const walletRepository = WalletRepository(this.dataSource);

    // Fetch all accounts with eligible roles
    const eligibleAccounts = await accountRepository.find({
      where: {
        role: In([Role.USER, Role.EVENT_CREATOR, Role.BUSINESS_OWNER]),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    const accountsWithWallets = await walletRepository.find({
      where: {
        ownedBy: In(eligibleAccounts.map((a) => a.id)),
      },
      select: {
        id: true,
        ownedBy: true,
      },
    });

    const accountsWithoutWallets = eligibleAccounts.filter(
      (a) => !accountsWithWallets.some((w) => w.ownedBy === a.id),
    );

    const results = {
      total: accountsWithoutWallets.length,
      eventsEmitted: 0,
      accounts: [] as Array<{ id: string; email: string; role: Role }>,
    };

    // Emit wallet creation event for each account
    for (const account of accountsWithoutWallets) {
      this.eventEmitter.emit(
        USER_REGISTRATION_CONFIRMED,
        new UserRegistrationConfirmedEvent(account as any),
      );
      results.eventsEmitted++;
      results.accounts.push({
        id: account.id,
        email: account.email,
        role: account.role,
      });
    }

    return {
      success: true,
      message: `Emitted wallet creation events for ${results.eventsEmitted} accounts`,
      details: results,
    };
  }
}
