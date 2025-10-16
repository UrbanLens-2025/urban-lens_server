import { Body, Controller, Inject, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateProvinceDto } from '@/common/dto/address/CreateProvince.dto';
import { UpdateProvinceDto } from '@/common/dto/address/UpdateProvince.dto';
import { IProvinceService } from '@/modules/address/app/IProvince.service';
import { CreateWardDto } from '@/common/dto/address/CreateWard.dto';
import { UpdateWardDto } from '@/common/dto/address/UpdateWard.dto';
import { IWardService } from '@/modules/address/app/IWard.service';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';

@ApiTags('Address')
@Roles(Role.ADMIN)
@ApiBearerAuth()
@Controller('/admin/address')
export class AddressAdminController {
  constructor(
    @Inject(IProvinceService)
    private readonly provinceService: IProvinceService,

    @Inject(IWardService)
    private readonly wardService: IWardService,
  ) {}

  // -------------------------------
  // Province Endpoints
  // -------------------------------

  @ApiOperation({ summary: 'Create provinces' })
  @Post('/provinces')
  createProvince(@Body() dto: CreateProvinceDto) {
    return this.provinceService.createProvince(dto);
  }

  @ApiOperation({ summary: 'Update province by code' })
  @Put('/provinces/:code')
  updateProvince(@Param('code') code: string, @Body() dto: UpdateProvinceDto) {
    return this.provinceService.updateProvince(code, dto);
  }

  // -------------------------------
  // Ward Endpoints
  // -------------------------------

  @ApiOperation({ summary: 'Create wards' })
  @Post('/wards')
  createWard(@Body() dto: CreateWardDto) {
    return this.wardService.createWard(dto);
  }

  @ApiOperation({ summary: 'Update ward by code' })
  @Put('/wards/:code')
  updateWard(@Param('code') code: string, @Body() dto: UpdateWardDto) {
    return this.wardService.updateWard(code, dto);
  }
}
