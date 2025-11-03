import {
  Body,
  Controller,
  Get,
  Inject,
  Ip,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { IWalletQueryService } from '@/modules/wallet/app/IWalletQuery.service';
import { CreateDepositTransactionDto } from '@/common/dto/wallet/CreateDepositTransaction.dto';
import { IWalletExternalTransactionManagementService } from '@/modules/wallet/app/IWalletExternalTransactionManagement.service';
import {
  IWalletExternalTransactionQueryService,
  IWalletExternalTransactionQueryService_QueryConfig,
} from '@/modules/wallet/app/IWalletExternalTransactionQuery.service';
import {
  IWalletTransactionQueryService,
  IWalletTransactionQueryService_QueryConfig,
} from '@/modules/wallet/app/IWalletTransactionQuery.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('/private/wallet')
export class WalletPrivateController {
  constructor(
    @Inject(IWalletQueryService)
    private readonly walletManagementService: IWalletQueryService,
    @Inject(IWalletExternalTransactionQueryService)
    private readonly externalTransactionQueryService: IWalletExternalTransactionQueryService,
    @Inject(IWalletExternalTransactionManagementService)
    private readonly externalTransactionManagementService: IWalletExternalTransactionManagementService,
    @Inject(IWalletTransactionQueryService)
    private readonly walletTransactionQueryService: IWalletTransactionQueryService,
  ) {}

  @ApiOperation({
    summary: 'Get my wallet',
    description:
      'Fetch the wallet belonging to the authenticated account (any role)',
  })
  @Get()
  getMyWallet(@AuthUser() user: JwtTokenDto) {
    return this.walletManagementService.getWalletByAccountId({
      accountId: user.sub,
    });
  }

  @ApiOperation({
    summary: 'Get my EXTERNAL transactions list',
  })
  @ApiPaginationQuery(
    IWalletExternalTransactionQueryService_QueryConfig.getExternalTransactionsByWalletId(),
  )
  @Get('/transactions/external')
  getMyExternalTransactions(
    @AuthUser() user: JwtTokenDto,
    @Paginate() query: PaginateQuery,
  ) {
    return this.externalTransactionQueryService.getExternalTransactionsByWalletId(
      {
        accountId: user.sub,
        query,
      },
    );
  }

  @ApiOperation({
    summary: 'Get my EXTERNAL transaction details by ID',
  })
  @Get('/transactions/external/:id')
  getMyExternalTransactionById(
    @AuthUser() user: JwtTokenDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.externalTransactionQueryService.getExternalTransactionByWalletIdAndId(
      {
        accountId: user.sub,
        transactionId: id,
      },
    );
  }

  @ApiOperation({
    summary: 'Deposit money from external account',
  })
  @Post('/external/deposit')
  depositFromExternalAccount(
    @AuthUser() user: JwtTokenDto,
    @Ip() ipAddress: string,
    @Body() dto: CreateDepositTransactionDto,
  ) {
    return this.externalTransactionManagementService.createDepositTransaction({
      ...dto,
      accountId: user.sub,
      accountName: user.email,
      ipAddress,
    });
  }

  @ApiOperation({
    summary: 'Get my wallet transactions list',
    description: 'Search and filter wallet transactions',
  })
  @ApiPaginationQuery(
    IWalletTransactionQueryService_QueryConfig.searchTransactions(),
  )
  @Get('/transactions')
  getMyTransactions(
    @Paginate() query: PaginateQuery,
    @AuthUser() userDto: JwtTokenDto,
  ) {
    return this.walletTransactionQueryService.searchTransactions({
      query,
      accountId: userDto.sub,
    });
  }

  @ApiOperation({
    summary: 'Get wallet transaction details by ID',
  })
  @Get('/transactions/:id')
  getTransactionById(
    @Param('id', ParseUUIDPipe) id: string,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.walletTransactionQueryService.getTransactionById({
      transactionId: id,
      accountId: user.sub,
    });
  }
}
