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
import { IAccountQueryService } from '@/modules/account/app/IAccountQuery.service';
import { IAccountProfileManagementService } from '@/modules/account/app/IAccountProfileManagement.service';
import { WithPagination } from '@/common/WithPagination.decorator';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';

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
  @WithPagination()
  getBusinessesWithPagination(@Paginate() query: PaginateQuery) {
    return this.accountQueryService.searchBusinesses(query);
  }

  @ApiOperation({
    summary: 'Update business status (Admin only)',
    description:
      'Admin can approve, reject, or change status. Admin notes required for rejection.',
  })
  @Put('/business/:id/status')
  updateBusinessStatus(
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
}
