import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { IPaymentGatewayPort } from '@/modules/wallet/app/ports/IPaymentGateway.port';
import { CreatePaymentLinkDto } from '@/common/dto/wallet/CreatePaymentLink.dto';
import { SupportedCurrency } from '@/common/constants/SupportedCurrency.constant';
import { type Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
import { AccountEntity } from '@/modules/account/domain/Account.entity';
import { IWalletTransactionManagementService } from '@/modules/wallet/app/IWalletTransactionManagement.service';
import { TransferFundsFromUserWalletDto } from '@/common/dto/wallet/TransferFundsFromUserWallet.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { DefaultSystemWallet } from '@/common/constants/DefaultSystemWallet.constant';
import { IWalletActionService } from '@/modules/wallet/app/IWalletAction.service';

@ApiTags('_Development')
@ApiBearerAuth()
@Controller('/dev-only/wallet')
export class WalletDevOnlyController {
  constructor(
    @Inject(IPaymentGatewayPort)
    private readonly paymentGateway: IPaymentGatewayPort,
    @Inject(IWalletExternalTransactionManagementService)
    private readonly walletExternalTransactionManagementService: IWalletExternalTransactionManagementService,
    @Inject(IPaymentGatewayPort)
    private readonly paymentGatewayPort: IPaymentGatewayPort,
    @Inject(IWalletTransactionManagementService)
    private readonly walletTransactionHandlerService: IWalletTransactionManagementService,
    @Inject(IWalletActionService)
    private readonly walletActionService: IWalletActionService,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * @deprecated
   * @param amount
   * @param transactionNo
   * @param transactionId
   * @returns
   */
  @ApiOperation({ summary: 'Mock confirm payment' })
  @Get('/mock-confirm-payment')
  mockConfirmPayment(
    @Query('amount') amount: number,
    @Query('transaction-number') transactionNo: number,
    @Query('transaction-id') transactionId: string,
  ) {
    const payload =
      this.paymentGatewayPort.createMockProcessPaymentConfirmationPayload({
        amount,
        transactionNo: transactionNo,
        transactionId,
      });
    return this.walletExternalTransactionManagementService.confirmDepositTransaction(
      {
        queryParams: payload,
        requestBody: payload,
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

  @ApiOperation({ summary: 'Transfer funds to escrow wallet' })
  @Post('/transfer-to-escrow')
  async transferToEscrow(
    @Body() dto: TransferFundsFromUserWalletDto,
    @AuthUser() userDto: JwtTokenDto,
  ) {
    return this.walletTransactionHandlerService.transferFundsFromUserWallet({
      ...dto,
      ownerId: userDto.sub,
      destinationWalletId: DefaultSystemWallet.ESCROW,
    });
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
    await this.dataSource.transaction(async (em) => {
      for (const account of accountsWithoutWallets) {
        this.eventEmitter.emit(
          USER_REGISTRATION_CONFIRMED,
          new UserRegistrationConfirmedEvent(
            account as unknown as AccountEntity,
          ),
        );
        results.eventsEmitted++;

        await this.walletActionService.createDefaultWallet({
          userId: account.id,
          entityManager: em,
        });

        results.accounts.push({
          id: account.id,
          email: account.email,
          role: account.role,
        });
      }
    });

    return {
      success: true,
      message: `Emitted wallet creation events for ${results.eventsEmitted} accounts`,
      details: results,
    };
  }
}
