import { CreateLocationVoucherDto } from '@/common/dto/gamification/CreateLocationVoucher.dto';
import { UpdateLocationVoucherDto } from '@/common/dto/gamification/UpdateLocationVoucher.dto';
import { Paginated, PaginateQuery } from 'nestjs-paginate';
import { LocationVoucherResponseDto } from '@/common/dto/gamification/LocationVoucher.response.dto';
import { AvailableVoucherResponseDto } from '@/common/dto/gamification/AvailableVoucher.response.dto';

export const ILocationVoucherService = Symbol('ILocationVoucherService');

export interface ILocationVoucherService {
  createVoucher(
    locationId: string,
    dto: CreateLocationVoucherDto,
  ): Promise<LocationVoucherResponseDto>;

  getVouchersByLocation(
    locationId: string,
    query: PaginateQuery,
  ): Promise<Paginated<LocationVoucherResponseDto>>;

  getVoucherById(voucherId: string): Promise<LocationVoucherResponseDto>;

  updateVoucher(
    voucherId: string,
    locationId: string,
    dto: UpdateLocationVoucherDto,
  ): Promise<LocationVoucherResponseDto>;

  deleteVoucher(voucherId: string, locationId: string): Promise<void>;

  getActiveVouchersByLocation(
    locationId: string,
    query: PaginateQuery,
  ): Promise<Paginated<LocationVoucherResponseDto>>;

  getAvailableVouchersByLocation(
    locationId: string,
    query: PaginateQuery,
  ): Promise<Paginated<AvailableVoucherResponseDto>>;

  getFreeAvailableVouchers(
    query: PaginateQuery,
  ): Promise<Paginated<AvailableVoucherResponseDto>>;
}
