import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { UpdateBusinessStatusDto } from '@/common/dto/business/UpdateBusinessStatus.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import {
  IAccountQueryService,
  IAccountQueryService_QueryConfig,
} from '@/modules/account/app/IAccountQuery.service';
import { IAccountProfileManagementService } from '@/modules/account/app/IAccountProfileManagement.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import { GetAccountByIdDto } from '@/common/dto/account/GetAccountById.dto';
import {
  IAccountWarningService,
  IAccountWarningService_QueryConfig,
} from '@/modules/account/app/IAccountWarning.service';
import { SuspendAccountDto } from '@/common/dto/account/SuspendAccount.dto';
import { SendWarningDto } from '@/common/dto/account/SendWarning.dto';

@ApiTags('Account')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('/admin/account')
export class AccountAdminController {
  constructor(
    @Inject(IAccountQueryService)
    private readonly accountQueryService: IAccountQueryService,
    @Inject(IAccountProfileManagementService)
    private readonly accountProfileManagementService: IAccountProfileManagementService,
    @Inject(IAccountWarningService)
    private readonly accountWarningService: IAccountWarningService,
  ) {}

  @ApiOperation({
    summary: 'Get businesses with pagination and filters',
    description:
      'Filter by status (PENDING, APPROVED, REJECTED) and search by name',
  })
  @Get('/business')
  @ApiPaginationQuery(IAccountQueryService_QueryConfig.searchBusinesses())
  getBusinessesWithPagination(@Paginate() query: PaginateQuery) {
    return this.accountQueryService.searchBusinesses(query);
  }

  @ApiOperation({
    summary: 'Process (Approve/Reject) Business',
    description:
      'Admin can approve, reject, or change status. Admin notes required for rejection.',
  })
  @Put('/business/:id/process')
  processBusiness(
    @Param('id', ParseUUIDPipe) businessId: string,
    @Body() updateStatusDto: UpdateBusinessStatusDto,
    @AuthUser() admin: JwtTokenDto,
  ) {
    return this.accountProfileManagementService.processBusinessRequest(
      businessId,
      updateStatusDto,
      admin.sub,
    );
  }

  @ApiOperation({
    summary: 'Get all accounts with pagination and filters',
    description:
      'Filter by role, hasOnboarded, isLocked. Search by email, firstName, lastName, phoneNumber',
  })
  @Get()
  @ApiPaginationQuery(IAccountQueryService_QueryConfig.getAllAccounts())
  getAllAccounts(@Paginate() query: PaginateQuery) {
    return this.accountQueryService.getAllAccounts(query);
  }

  @ApiOperation({
    summary: 'Get account by ID',
    description: 'Get any account by ID, including admin accounts',
  })
  @Get('/:id')
  getAccountById(@Param('id', ParseUUIDPipe) accountId: string) {
    const dto: GetAccountByIdDto = { accountId };
    return this.accountQueryService.getAccountById(dto);
  }

  @ApiOperation({
    summary: 'Get suspensions by account ID',
    description: 'Get all suspensions for a specific account',
  })
  @ApiPaginationQuery(
    IAccountWarningService_QueryConfig.getAccountSuspensions(),
  )
  @Get('/:id/suspensions')
  getAccountSuspensions(
    @Param('id', ParseUUIDPipe) accountId: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.accountWarningService.getAccountSuspensions({
      accountId,
      query,
    });
  }

  @ApiOperation({
    summary: 'Suspend account',
    description:
      'Suspend a user account. Can only suspend USER, BUSINESS_OWNER, or EVENT_CREATOR accounts. Cannot suspend ADMIN accounts.',
  })
  @Post('/:id/suspend')
  suspendAccount(
    @Param('id', ParseUUIDPipe) targetId: string,
    @AuthUser() admin: JwtTokenDto,
    @Body() suspendAccountDto: SuspendAccountDto,
  ) {
    return this.accountWarningService.suspendAccount({
      ...suspendAccountDto,
      targetId,
      accountId: admin.sub,
    });
  }

  @ApiOperation({
    summary: 'Get warnings by account ID',
    description: 'Get all warnings for a specific account',
  })
  @ApiPaginationQuery(IAccountWarningService_QueryConfig.getAllWarnings())
  @Get('/:id/warnings')
  getAccountWarnings(
    @Param('id', ParseUUIDPipe) accountId: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.accountWarningService.getAllWarningsByAccountId({
      accountId,
      query,
    });
  }

  @ApiOperation({
    summary: 'Send warning to account',
    description: 'Send a warning to a specific account',
  })
  @Post('/:id/warnings')
  sendWarning(
    @Param('id', ParseUUIDPipe) accountId: string,
    @AuthUser() admin: JwtTokenDto,
    @Body() sendWarningDto: SendWarningDto,
  ) {
    return this.accountWarningService.sendWarning({
      ...sendWarningDto,
      targetAccountId: accountId,
      createdById: admin.sub,
    });
  }

  @ApiOperation({
    summary: 'Lift suspension',
    description: 'Lift (deactivate) a suspension by setting is_active to false',
  })
  @Put('/:accountId/suspensions/:suspensionId/lift')
  liftSuspension(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Param('suspensionId', ParseUUIDPipe) suspensionId: string,
    @AuthUser() admin: JwtTokenDto,
  ) {
    return this.accountWarningService.liftSuspension({
      suspensionId,
      targetAccountId: accountId,
      accountId: admin.sub,
    });
  }
}
