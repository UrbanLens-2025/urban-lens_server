import { CreateProvinceDto } from '@/common/dto/address/CreateProvince.dto';
import { ProvinceResponseDto } from '@/common/dto/address/res/Province.response.dto';
import { UpdateProvinceDto } from '@/common/dto/address/UpdateProvince.dto';
import { UpdateResult } from 'typeorm';
import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { ProvinceEntity } from '@/modules/utility/domain/Province.entity';

export const IProvinceService = Symbol('IProvinceService');
export interface IProvinceService {
  createProvince(dto: CreateProvinceDto): Promise<ProvinceResponseDto[]>;
  updateProvince(code: string, dto: UpdateProvinceDto): Promise<UpdateResult>;
  searchProvinces(
    query: PaginateQuery,
  ): Promise<Paginated<ProvinceResponseDto>>;
  searchProvincesVisible(
    query: PaginateQuery,
  ): Promise<Paginated<ProvinceResponseDto>>;
}

export namespace IProvinceService_QueryConfig {
  export function searchProvinces(): PaginateConfig<ProvinceEntity> {
    return {
      sortableColumns: ['code', 'name'],
      searchableColumns: ['name'],
      defaultSortBy: [['name', 'DESC']],
    };
  }

  export function searchProvincesVisible(): PaginateConfig<ProvinceEntity> {
    return {
      sortableColumns: ['code', 'name'],
      searchableColumns: ['name'],
      defaultSortBy: [['name', 'DESC']],
    };
  }
}
