import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateProvinceDto } from '@/common/dto/address/CreateProvince.dto';
import { UpdateProvinceDto } from '@/common/dto/address/UpdateProvince.dto';
import {
  IProvinceService,
  IProvinceService_QueryConfig,
} from '@/modules/utility/app/IProvince.service';
import { CreateWardDto } from '@/common/dto/address/CreateWard.dto';
import { UpdateWardDto } from '@/common/dto/address/UpdateWard.dto';
import {
  IWardService,
  IWardService_QueryConfig,
} from '@/modules/utility/app/IWard.service';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';

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

  @ApiOperation({ summary: 'Get all provinces' })
  @ApiPaginationQuery(IProvinceService_QueryConfig.searchProvinces())
  @Get('/provinces/search')
  getProvinces(@Paginate() query: PaginateQuery) {
    return this.provinceService.searchProvinces(query);
  }

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

  @ApiOperation({ summary: 'Get all wards' })
  @ApiPaginationQuery(IWardService_QueryConfig.searchWard())
  @Get('/wards/search')
  getWards(@Paginate() query: PaginateQuery) {
    return this.wardService.searchWard(query);
  }

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
