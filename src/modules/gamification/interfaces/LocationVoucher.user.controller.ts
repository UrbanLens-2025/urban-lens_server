import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { WithPagination } from '@/common/WithPagination.decorator';
import type { PaginationParams } from '@/common/services/base.service';
import { ILocationVoucherService } from '../app/ILocationVoucher.service';

@ApiTags('Location Voucher (User)')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('/user/location-voucher')
export class LocationVoucherUserController {
  constructor(
    @Inject(ILocationVoucherService)
    private readonly locationVoucherService: ILocationVoucherService,
  ) {}

  @ApiOperation({
    summary: 'Get available vouchers by location',
    description:
      'Get all available vouchers for exchange at a specific location',
  })
  @Get('/:locationId')
  @WithPagination()
  getAvailableVouchersByLocation(
    @Param('locationId') locationId: string,
    @Query() params: PaginationParams,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationVoucherService.getAvailableVouchersByLocation(
      locationId,
      params,
    );
  }

  @ApiOperation({
    summary: 'Get voucher by ID',
    description: 'Get a specific voucher by its ID',
  })
  @Get('/voucher/:voucherId')
  getVoucherById(
    @Param('voucherId') voucherId: string,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationVoucherService.getVoucherById(voucherId);
  }
}
