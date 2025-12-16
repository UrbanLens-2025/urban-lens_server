import { Role } from '@/common/constants/Role.constant';
import { Roles } from '@/common/Roles.decorator';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
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
import { IWalletExternalTransactionManagementService } from '@/modules/wallet/app/IWalletExternalTransactionManagement.service';
import { MarkTransferFailedDto } from '@/common/dto/wallet/MarkTransferFailed.dto';
import { RejectWithdrawTransactionDto } from '@/common/dto/wallet/RejectWithdrawTransaction.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { CompleteProcessingWithdrawTransactionDto } from '@/common/dto/wallet/CompleteProcessingWithdrawTransaction.dto';
import {
  IWalletTransactionQueryService,
  IWalletTransactionQueryService_QueryConfig,
} from '@/modules/wallet/app/IWalletTransactionQuery.service';

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
    @Inject(IWalletExternalTransactionManagementService)
    private readonly walletExternalTransactionManagementService: IWalletExternalTransactionManagementService,
    @Inject(IWalletTransactionQueryService)
    private readonly walletTransactionQueryService: IWalletTransactionQueryService,
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

  @ApiOperation({ summary: 'Start processing withdraw transaction' })
  @Post('/transactions/external/:transactionId/start-processing')
  startProcessingWithdrawTransaction(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.walletExternalTransactionManagementService.startProcessingWithdrawTransaction(
      {
        transactionId,
        accountId: user.sub,
        accountName: user.email,
      },
    );
  }

  @ApiOperation({ summary: 'Complete processing withdraw transaction' })
  @Post('/transactions/external/:transactionId/complete-processing')
  completeProcessingWithdrawTransaction(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
    @AuthUser() user: JwtTokenDto,
    @Body() dto: CompleteProcessingWithdrawTransactionDto,
  ) {
    return this.walletExternalTransactionManagementService.completeProcessingWithdrawTransaction(
      {
        ...dto,
        transactionId,
        accountId: user.sub,
        accountName: user.email,
      },
    );
  }

  @ApiOperation({ summary: 'Mark transfer as failed' })
  @Post('/transactions/external/:transactionId/mark-transfer-failed')
  markTransferFailed(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
    @Body() dto: MarkTransferFailedDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.walletExternalTransactionManagementService.markTransferFailed({
      ...dto,
      transactionId,
      accountId: user.sub,
      accountName: user.email,
    });
  }

  @ApiOperation({ summary: 'Reject withdraw transaction' })
  @Post('/transactions/external/:transactionId/reject')
  rejectWithdrawTransaction(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
    @Body() dto: RejectWithdrawTransactionDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.walletExternalTransactionManagementService.rejectWithdrawTransaction(
      {
        ...dto,
        transactionId,
        accountId: user.sub,
        accountName: user.email,
      },
    );
  }

  @ApiOperation({ summary: 'Get any internal transaction by ID' })
  @Get('/transactions/internal/get-by-id/:transactionId')
  getAnyInternalTransactionById(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
  ) {
    return this.walletTransactionQueryService.getAnyTransactionById({
      transactionId,
    });
  }

  @ApiOperation({ summary: 'Get all internal transactions by wallet ID' })
  @ApiPaginationQuery(
    IWalletTransactionQueryService_QueryConfig.getAllTransactionsByWalletId(),
  )
  @Get('/transactions/internal/:walletId')
  getAllInternalTransactionsByWalletId(
    @Param('walletId', ParseUUIDPipe) walletId: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.walletTransactionQueryService.getAllTransactionsByWalletId({
      query,
      walletId,
    });
  }
}
