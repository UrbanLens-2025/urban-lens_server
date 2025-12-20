import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { ILocationVoucherService } from '../app/ILocationVoucher.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

@ApiTags('Location Voucher')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('/user/location-voucher')
export class LocationVoucherUserController {
  constructor(
    @Inject(ILocationVoucherService)
    private readonly locationVoucherService: ILocationVoucherService,
  ) {}

  @ApiOperation({
    summary: 'Get all free available vouchers',
    description:
      'Get all free vouchers (price = 0 points) that are currently active and available for redemption',
  })
  @ApiPaginationQuery({
    sortableColumns: ['createdAt', 'startDate', 'endDate'],
    defaultSortBy: [['createdAt', 'DESC']],
    searchableColumns: ['title', 'voucherCode'],
    filterableColumns: {
      voucherType: true,
      locationId: true,
    },
  })
  @Get('/free')
  getFreeAvailableVouchers(
    @Paginate() query: PaginateQuery,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationVoucherService.getFreeAvailableVouchers(
      query,
      user.sub,
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

  @ApiOperation({
    summary: 'Get all available vouchers for exchange',
    description:
      'Get all vouchers (free and paid) that are currently active and available for exchange, from all locations (including locations where user has not checked in)',
  })
  @ApiPaginationQuery({
    sortableColumns: ['createdAt', 'pricePoint', 'startDate', 'endDate'],
    defaultSortBy: [['createdAt', 'DESC']],
    searchableColumns: ['title', 'voucherCode'],
    filterableColumns: {
      voucherType: true,
      locationId: true,
      pricePoint: true,
    },
  })
  @Get('/available')
  getAllAvailableVouchers(
    @Paginate() query: PaginateQuery,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationVoucherService.getAllAvailableVouchers(query, user.sub);
  }

  @ApiOperation({
    summary: 'Get available vouchers by location',
    description:
      'Get all available vouchers for exchange at a specific location',
  })
  @ApiPaginationQuery({
    sortableColumns: ['createdAt', 'pricePoint', 'startDate', 'endDate'],
    defaultSortBy: [['createdAt', 'DESC']],
    searchableColumns: ['title', 'voucherCode'],
    filterableColumns: {
      voucherType: true,
    },
  })
  @Get('/:locationId')
  getAvailableVouchersByLocation(
    @Param('locationId') locationId: string,
    @Paginate() query: PaginateQuery,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationVoucherService.getAvailableVouchersByLocation(
      locationId,
      query,
      user.sub,
    );
  }
}
