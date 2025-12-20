import { Controller, Get, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import {
  ILocationVoucherService,
  ILocationVoucherService_QueryConfig,
} from '../app/ILocationVoucher.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

@ApiBearerAuth()
@ApiTags('Location Voucher')
@Roles(Role.ADMIN)
@Controller('/admin/location-voucher')
export class LocationVoucherAdminController {
  constructor(
    @Inject(ILocationVoucherService)
    private readonly locationVoucherService: ILocationVoucherService,
  ) {}

  @ApiOperation({
    summary: 'Get all location vouchers (admin, unrestricted)',
    description:
      'Get all vouchers in the system regardless of status or availability',
  })
  @ApiPaginationQuery(
    ILocationVoucherService_QueryConfig.getAllVouchersUnfiltered(),
  )
  @Get()
  getAllVouchers(@Paginate() query: PaginateQuery) {
    return this.locationVoucherService.getAllVouchersUnfiltered(query);
  }
}
