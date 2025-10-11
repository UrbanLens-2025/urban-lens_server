import {
  Controller,
  Get,
  Inject,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { IProvinceService } from '@/modules/address/app/IProvince.service';
import { IWardService } from '@/modules/address/app/IWard.service';
import { WithPagination } from '@/common/WithPagination.decorator';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor } from '@nestjs/cache-manager';

@UseInterceptors(CacheInterceptor)
@ApiTags('Address - Public')
@Controller('/public/address')
export class AddressPublicController {
  constructor(
    @Inject(IProvinceService)
    private readonly provinceService: IProvinceService,
    @Inject(IWardService)
    private readonly wardService: IWardService,
  ) {}

  @WithPagination()
  @Get('/province')
  getProvinces(@Paginate() query: PaginateQuery) {
    return this.provinceService.searchProvinces(query);
  }

  @WithPagination()
  @ApiParam({
    name: 'provinceCode',
    description: 'The code of the province to filter wards',
    example: '01',
  })
  @Get('/province/:provinceCode/ward')
  getWards(
    @Param('provinceCode') provinceCode: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.wardService.searchWard(query, provinceCode);
  }
}
