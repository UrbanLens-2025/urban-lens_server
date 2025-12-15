import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
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
}
