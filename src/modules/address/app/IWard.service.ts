import { UpdateResult } from 'typeorm';
import { Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreateWardDto } from '@/common/dto/address/CreateWard.dto';
import { UpdateWardDto } from '@/common/dto/address/UpdateWard.dto';
import { WardResponseDto } from '@/common/dto/address/res/Ward.response.dto';

export const IWardService = Symbol('IWardService');
export interface IWardService {
  createWard(dto: CreateWardDto): Promise<WardResponseDto[]>;
  updateWard(code: string, dto: UpdateWardDto): Promise<UpdateResult>;
  searchWard(
    query: PaginateQuery,
    provinceCode: string,
  ): Promise<Paginated<WardResponseDto>>;
}
