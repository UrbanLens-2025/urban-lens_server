import {
  Controller,
  Get,
  Inject,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import {
  IProvinceService,
  IProvinceService_QueryConfig,
} from '@/modules/utility/app/IProvince.service';
import {
  IWardService,
  IWardService_QueryConfig,
} from '@/modules/utility/app/IWard.service';
import {
  ApiPaginationQuery,
  Paginate,
  type PaginateQuery,
} from 'nestjs-paginate';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';

@UseInterceptors(CacheInterceptor)
@ApiTags('Address')
@Controller('/public/address')
export class AddressPublicController {
  constructor(
    @Inject(IProvinceService)
    private readonly provinceService: IProvinceService,
    @Inject(IWardService)
    private readonly wardService: IWardService,
  ) {}

  @ApiOperation({ summary: 'Get list of selectable provinces' })
  @ApiPaginationQuery(IProvinceService_QueryConfig.searchProvincesVisible())
  @Get('/province')
  getProvinces(@Paginate() query: PaginateQuery) {
    return this.provinceService.searchProvincesVisible(query);
  }

  @ApiOperation({ summary: 'Get list of selectable wards by province code' })
  @ApiPaginationQuery(IWardService_QueryConfig.searchWardVisible())
  @Get('/province/:provinceCode/ward')
  getWards(
    @Param('provinceCode') provinceCode: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.wardService.searchWardVisible(query, provinceCode);
  }
}
