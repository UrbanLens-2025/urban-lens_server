import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { ILocationVoucherService } from '../app/ILocationVoucher.service';
import type { IVoucherExchangeService } from '../app/IVoucherExchange.service';
import {
  IGamificationQueryService,
  IGamificationQueryService_QueryConfig,
} from '../app/IGamificationQuery.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiProperty,
} from '@nestjs/swagger';
import { CreateLocationVoucherDto } from '@/common/dto/gamification/CreateLocationVoucher.dto';
import { UpdateLocationVoucherDto } from '@/common/dto/gamification/UpdateLocationVoucher.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { IsNotEmpty, IsString } from 'class-validator';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

export class VerifyVoucherCodeDto {
  @ApiProperty({
    description: 'User voucher code to verify and mark as used',
    example: 'VC-1699999-A1B2C3',
  })
  @IsNotEmpty()
  @IsString()
  userVoucherCode: string;
}

@ApiTags('Location Voucher (Business Owner)')
@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@Controller('/business/location-voucher')
export class LocationVoucherBusinessController {
  constructor(
    @Inject(ILocationVoucherService)
    private readonly locationVoucherService: ILocationVoucherService,
    @Inject('IVoucherExchangeService')
    private readonly voucherExchangeService: IVoucherExchangeService,
    @Inject(IGamificationQueryService)
    private readonly gamificationQueryService: IGamificationQueryService,
  ) {}

  @ApiOperation({
    summary: 'Verify and use voucher code',
    description:
      'Business owner scans/enters user voucher code to mark it as used',
  })
  @Post('/verify-code')
  async verifyVoucherCode(
    @Body() dto: VerifyVoucherCodeDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    const result = await this.voucherExchangeService.useVoucherByCode(
      dto.userVoucherCode,
    );

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    return result;
  }

  @ApiOperation({
    summary: 'Create location voucher',
    description: 'Create a new voucher for a specific location',
  })
  @Post('/:locationId')
  createVoucher(
    @Param('locationId') locationId: string,
    @Body() dto: CreateLocationVoucherDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationVoucherService.createVoucher(locationId, dto);
  }

  @ApiOperation({
    summary: 'Get vouchers by location',
    description: 'Get all vouchers for a specific location',
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
  getVouchersByLocation(
    @Param('locationId') locationId: string,
    @Paginate() query: PaginateQuery,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationVoucherService.getVouchersByLocation(locationId, query);
  }

  @ApiOperation({
    summary: 'Get active vouchers by location',
    description: 'Get all active vouchers for a specific location',
  })
  @ApiPaginationQuery({
    sortableColumns: ['createdAt', 'pricePoint', 'startDate', 'endDate'],
    defaultSortBy: [['createdAt', 'DESC']],
    searchableColumns: ['title', 'voucherCode'],
    filterableColumns: {
      voucherType: true,
    },
  })
  @Get('/:locationId/active')
  getActiveVouchersByLocation(
    @Param('locationId') locationId: string,
    @Paginate() query: PaginateQuery,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationVoucherService.getActiveVouchersByLocation(
      locationId,
      query,
    );
  }

  @ApiOperation({
    summary: 'Get available vouchers by location',
    description:
      'Get all available vouchers (with stock) for a specific location',
  })
  @ApiPaginationQuery({
    sortableColumns: ['createdAt', 'pricePoint', 'startDate', 'endDate'],
    defaultSortBy: [['createdAt', 'DESC']],
    searchableColumns: ['title', 'voucherCode'],
    filterableColumns: {
      voucherType: true,
    },
  })
  @Get('/:locationId/available')
  getAvailableVouchersByLocation(
    @Param('locationId') locationId: string,
    @Paginate() query: PaginateQuery,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationVoucherService.getAvailableVouchersByLocation(
      locationId,
      query,
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
    summary: 'Update voucher',
    description: 'Update a specific voucher',
  })
  @Put('/:locationId/:voucherId')
  updateVoucher(
    @Param('locationId') locationId: string,
    @Param('voucherId') voucherId: string,
    @Body() dto: UpdateLocationVoucherDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationVoucherService.updateVoucher(
      voucherId,
      locationId,
      dto,
    );
  }

  @ApiOperation({
    summary: 'Delete voucher',
    description: 'Delete a specific voucher',
  })
  @Delete('/:locationId/:voucherId')
  deleteVoucher(
    @Param('locationId') locationId: string,
    @Param('voucherId') voucherId: string,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationVoucherService.deleteVoucher(voucherId, locationId);
  }

  @ApiOperation({
    summary: 'Get voucher users',
    description:
      'Get list of users who have exchanged or used a voucher. Filter by status: exchanged, used, or all.',
  })
  @ApiPaginationQuery(IGamificationQueryService_QueryConfig.getVoucherUsers())
  @Get('/voucher/:voucherId/users')
  getVoucherUsers(
    @Paginate() query: PaginateQuery,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.gamificationQueryService.getVoucherUsers({
      businessOwnerId: user.sub,
      query,
    });
  }
}
