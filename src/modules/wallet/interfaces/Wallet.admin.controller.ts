import { Role } from '@/common/constants/Role.constant';
import { Roles } from '@/common/Roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Inject, Param, ParseUUIDPipe } from '@nestjs/common';
import { IWalletQueryService } from '@/modules/wallet/app/IWalletQuery.service';
import { DefaultSystemWallet } from '@/common/constants/DefaultSystemWallet.constant';
import {
  IWalletExternalTransactionQueryService,
  IWalletExternalTransactionQueryService_QueryConfig,
} from '@/modules/wallet/app/IWalletExternalTransactionQuery.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

@ApiTags('Wallet')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('/admin/wallet')
export class WalletAdminController {
  constructor(
    @Inject(IWalletQueryService)
    private readonly walletQueryService: IWalletQueryService,
    @Inject(IWalletExternalTransactionQueryService)
    private readonly walletExternalTransactionQueryService: IWalletExternalTransactionQueryService,
  ) {}

  @ApiOperation({
    summary: 'Get escrow wallet',
  })
  @Get('/escrow')
  getEscrowWallet() {
    return this.walletQueryService.getAnyWalletById({
      walletId: DefaultSystemWallet.ESCROW,
    });
  }

  @ApiOperation({
    summary: 'Get system wallet',
  })
  @Get('/system')
  getSystemWallet() {
    return this.walletQueryService.getAnyWalletById({
      walletId: DefaultSystemWallet.REVENUE,
    });
  }

  @ApiOperation({ summary: 'Get all external transactions' })
  @ApiPaginationQuery(
    IWalletExternalTransactionQueryService_QueryConfig.getAllExternalTransactions(),
  )
  @Get('/transactions/external/search')
  getAllExternalTransactions(@Paginate() query: PaginateQuery) {
    return this.walletExternalTransactionQueryService.getAllExternalTransactions(
      { query },
    );
  }

  @ApiOperation({ summary: 'Get any external transaction by ID' })
  @Get('/transactions/external/:transactionId')
  getAnyExternalTransactionById(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
  ) {
    return this.walletExternalTransactionQueryService.getAnyExternalTransactionById(
      { transactionId },
    );
  }
}
