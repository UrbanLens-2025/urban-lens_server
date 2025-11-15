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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import type { IVoucherExchangeService } from '../app/IVoucherExchange.service';
import { IsNotEmpty, IsUUID, IsString } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UserVoucherResponseDto } from '@/common/dto/gamification/UserVoucher.response.dto';

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
    description: 'Exchange history ID to use',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  exchangeHistoryId: string;
}

export class UseVoucherByCodeDto {
  @ApiProperty({
    description: 'Unique voucher code',
    example: 'VC-1234567890-ABC123',
  })
  @IsNotEmpty()
  @IsString()
  userVoucherCode: string;
}

export class VoucherExchangeResponseDto {
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
      exchangeHistory: result.exchangeHistory || undefined,
    };
  }

  @ApiOperation({
    summary: 'Use a voucher by ID',
    description: 'Mark a voucher as used by exchange history ID',
  })
  @Post('/use')
  async useVoucher(@Body() dto: UseVoucherDto, @AuthUser() user: JwtTokenDto) {
    const result = await this.voucherExchangeService.useVoucher(
      user.sub,
      dto.exchangeHistoryId,
    );

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    return result;
  }

  @ApiOperation({
    summary: 'Use a voucher by code',
    description: 'Mark a voucher as used by scanning unique voucher code',
  })
  @Post('/use-by-code')
  async useVoucherByCode(@Body() dto: UseVoucherByCodeDto) {
    const result = await this.voucherExchangeService.useVoucherByCode(
      dto.userVoucherCode,
    );

    if (!result.success) {
      throw new BadRequestException(result.message);
    }

    return result;
  }

  @ApiOperation({
    summary: 'Get user vouchers',
    description: 'Get all vouchers owned by the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user vouchers',
    type: [UserVoucherResponseDto],
  })
  @Get('/vouchers')
  async getUserVouchers(
    @AuthUser() user: JwtTokenDto,
  ): Promise<UserVoucherResponseDto[]> {
    const vouchers = await this.voucherExchangeService.getUserVouchers(
      user.sub,
    );

    return plainToInstance(UserVoucherResponseDto, vouchers, {
      excludeExtraneousValues: true,
    });
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
    description: 'Get history of voucher exchanges and usage',
  })
  @Get('/history')
  async getUserExchangeHistory(@AuthUser() user: JwtTokenDto) {
    const history = await this.voucherExchangeService.getUserExchangeHistory(
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
