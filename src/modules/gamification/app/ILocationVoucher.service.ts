import { CreateLocationVoucherDto } from '@/common/dto/gamification/CreateLocationVoucher.dto';
import { UpdateLocationVoucherDto } from '@/common/dto/gamification/UpdateLocationVoucher.dto';
import { Paginated, PaginateQuery, PaginateConfig } from 'nestjs-paginate';
import { LocationVoucherResponseDto } from '@/common/dto/gamification/LocationVoucher.response.dto';
import { AvailableVoucherResponseDto } from '@/common/dto/gamification/AvailableVoucher.response.dto';
import { LocationVoucherEntity } from '@/modules/gamification/domain/LocationVoucher.entity';

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
    userId?: string,
  ): Promise<Paginated<AvailableVoucherResponseDto>>;

  getFreeAvailableVouchers(
    query: PaginateQuery,
    userId?: string,
  ): Promise<Paginated<AvailableVoucherResponseDto>>;

  getAllAvailableVouchers(
    query: PaginateQuery,
    userId?: string,
  ): Promise<Paginated<AvailableVoucherResponseDto>>;

  getAllVouchersUnfiltered(
    query: PaginateQuery,
  ): Promise<Paginated<LocationVoucherResponseDto>>;
}

export namespace ILocationVoucherService_QueryConfig {
  export function getAllVouchersUnfiltered(): PaginateConfig<LocationVoucherEntity> {
    return {
      sortableColumns: ['createdAt', 'pricePoint', 'startDate', 'endDate'],
      defaultSortBy: [['createdAt', 'DESC']],
      searchableColumns: ['title', 'voucherCode'],
      filterableColumns: {
        voucherType: true,
        locationId: true,
      },
      relations: {
        location: true,
      },
    };
  }
}
