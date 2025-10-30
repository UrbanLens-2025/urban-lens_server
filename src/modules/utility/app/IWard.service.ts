import { UpdateResult } from 'typeorm';
import { PaginateConfig, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreateWardDto } from '@/common/dto/address/CreateWard.dto';
import { UpdateWardDto } from '@/common/dto/address/UpdateWard.dto';
import { WardResponseDto } from '@/common/dto/address/res/Ward.response.dto';
import { WardEntity } from '@/modules/utility/domain/Ward.entity';

export const IWardService = Symbol('IWardService');
export interface IWardService {
  createWard(dto: CreateWardDto): Promise<WardResponseDto[]>;
  updateWard(code: string, dto: UpdateWardDto): Promise<UpdateResult>;
  searchWard(query: PaginateQuery): Promise<Paginated<WardResponseDto>>;
  searchWardVisible(
    query: PaginateQuery,
    provinceCode: string,
  ): Promise<Paginated<WardResponseDto>>;
}

export namespace IWardService_QueryConfig {
  export function searchWard(): PaginateConfig<WardEntity> {
    return {
      sortableColumns: ['code', 'name'],
      searchableColumns: ['name'],
      defaultSortBy: [['name', 'DESC']],
      filterableColumns: {
        provinceCode: true,
      },
    };
  }

  export function searchWardVisible(): PaginateConfig<WardEntity> {
    return {
      sortableColumns: ['code', 'name'],
      searchableColumns: ['name'],
      defaultSortBy: [['name', 'DESC']],
    };
  }
}
