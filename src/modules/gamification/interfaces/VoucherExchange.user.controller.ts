import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import type { IVoucherExchangeService } from '../app/IVoucherExchange.service';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ExchangeVoucherDto {
  @ApiProperty({
    description: 'Voucher ID to exchange',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  voucherId: string;
}

export class UseVoucherDto {
  @ApiProperty({
    description: 'User voucher ID to use',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  userVoucherId: string;
}

export class VoucherExchangeResponseDto {
  userVoucher?: any;
  exchangeHistory?: any;
}

export class VoucherUsageResponseDto {
  usage?: any;
}

export class UserVoucherStatsResponseDto {
  totalVouchers: number;
  totalUsed: number;
  availableVouchers: number;
}

@ApiTags('Voucher Exchange (User)')
@ApiBearerAuth()
@Roles(Role.USER)
@Controller('/user/voucher-exchange')
export class VoucherExchangeUserController {
  constructor(
    @Inject('IVoucherExchangeService')
    private readonly voucherExchangeService: IVoucherExchangeService,
  ) {}

  @ApiOperation({
    summary: 'Exchange points for voucher',
    description: 'Exchange location-specific points for a voucher',
  })
  @Post('/exchange')
  async exchangeVoucher(
    @Body() dto: ExchangeVoucherDto,
    @AuthUser() user: JwtTokenDto,
  ): Promise<VoucherExchangeResponseDto> {
    const result = await this.voucherExchangeService.exchangeVoucher(
      user.sub,
      dto.voucherId,
    );

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    return {
      userVoucher: result.userVoucher || undefined,
      exchangeHistory: result.exchangeHistory || undefined,
    };
  }

  @ApiOperation({
    summary: 'Use a voucher',
    description: 'Mark a voucher as used',
  })
  @Post('/use')
  async useVoucher(
    @Body() dto: UseVoucherDto,
    @AuthUser() user: JwtTokenDto,
  ): Promise<VoucherUsageResponseDto> {
    const result = await this.voucherExchangeService.useVoucher(
      user.sub,
      dto.userVoucherId,
    );

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    return {
      usage: result.usage || undefined,
    };
  }

  @ApiOperation({
    summary: 'Get user vouchers',
    description: 'Get all vouchers owned by the current user',
  })
  @Get('/vouchers')
  async getUserVouchers(@AuthUser() user: JwtTokenDto) {
    const vouchers = await this.voucherExchangeService.getUserVouchers(
      user.sub,
    );

    return vouchers;
  }

  @ApiOperation({
    summary: 'Get user voucher stats',
    description: 'Get statistics about user vouchers',
  })
  @Get('/stats')
  async getUserVoucherStats(
    @AuthUser() user: JwtTokenDto,
  ): Promise<UserVoucherStatsResponseDto> {
    return this.voucherExchangeService.getUserVoucherStats(user.sub);
  }

  @ApiOperation({
    summary: 'Get user exchange history',
    description: 'Get history of voucher exchanges',
  })
  @Get('/exchange-history')
  async getUserExchangeHistory(@AuthUser() user: JwtTokenDto) {
    const history = await this.voucherExchangeService.getUserExchangeHistory(
      user.sub,
    );

    return history;
  }

  @ApiOperation({
    summary: 'Get user usage history',
    description: 'Get history of voucher usage',
  })
  @Get('/usage-history')
  async getUserUsageHistory(@AuthUser() user: JwtTokenDto) {
    const history = await this.voucherExchangeService.getUserUsageHistory(
      user.sub,
    );

    return history;
  }

  @ApiOperation({
    summary: 'Get vouchers by location',
    description: 'Get all vouchers for a specific location',
  })
  @Get('/location/:locationId')
  async getVouchersByLocation(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @AuthUser() user: JwtTokenDto,
  ) {
    const vouchers = await this.voucherExchangeService.getUserVouchers(
      user.sub,
    );

    // Filter by location
    const locationVouchers = vouchers.filter(
      (voucher) => voucher.voucher.locationId === locationId,
    );

    return locationVouchers;
  }
}
