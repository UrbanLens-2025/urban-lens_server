import { CreateProvinceDto } from '@/common/dto/address/CreateProvince.dto';
import { ProvinceResponseDto } from '@/common/dto/address/res/Province.response.dto';
import { UpdateProvinceDto } from '@/common/dto/address/UpdateProvince.dto';
import { UpdateResult } from 'typeorm';
import { Paginated, PaginateQuery } from 'nestjs-paginate';

export const IProvinceService = Symbol('IProvinceService');
export interface IProvinceService {
  createProvince(dto: CreateProvinceDto): Promise<ProvinceResponseDto[]>;
  updateProvince(code: string, dto: UpdateProvinceDto): Promise<UpdateResult>;
  searchProvinces(
    query: PaginateQuery,
  ): Promise<Paginated<ProvinceResponseDto>>;
}
