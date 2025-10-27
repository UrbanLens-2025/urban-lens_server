import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ILocationVoucherService } from '../app/ILocationVoucher.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateLocationVoucherDto } from '@/common/dto/gamification/CreateLocationVoucher.dto';
import { UpdateLocationVoucherDto } from '@/common/dto/gamification/UpdateLocationVoucher.dto';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { WithPagination } from '@/common/WithPagination.decorator';
import type { PaginationParams } from '@/common/services/base.service';

@ApiTags('Location Voucher (Business Owner)')
@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@Controller('/business/location-voucher')
export class LocationVoucherBusinessController {
  constructor(
    @Inject(ILocationVoucherService)
    private readonly locationVoucherService: ILocationVoucherService,
  ) {}

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
  @Get('/:locationId')
  @WithPagination()
  getVouchersByLocation(
    @Param('locationId') locationId: string,
    @Query() params: PaginationParams,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationVoucherService.getVouchersByLocation(
      locationId,
      params,
    );
  }

  @ApiOperation({
    summary: 'Get active vouchers by location',
    description: 'Get all active vouchers for a specific location',
  })
  @Get('/:locationId/active')
  @WithPagination()
  getActiveVouchersByLocation(
    @Param('locationId') locationId: string,
    @Query() params: PaginationParams,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.locationVoucherService.getActiveVouchersByLocation(
      locationId,
      params,
    );
  }

  @ApiOperation({
    summary: 'Get available vouchers by location',
    description:
      'Get all available vouchers (with stock) for a specific location',
  })
  @Get('/:locationId/available')
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
}
