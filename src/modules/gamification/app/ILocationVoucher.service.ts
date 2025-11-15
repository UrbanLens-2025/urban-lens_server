import { CreateLocationVoucherDto } from '@/common/dto/gamification/CreateLocationVoucher.dto';
import { UpdateLocationVoucherDto } from '@/common/dto/gamification/UpdateLocationVoucher.dto';
import { Paginated, PaginateQuery } from 'nestjs-paginate';

export const ILocationVoucherService = Symbol('ILocationVoucherService');

export interface ILocationVoucherService {
  createVoucher(
    locationId: string,
    dto: CreateLocationVoucherDto,
  ): Promise<any>;

  getVouchersByLocation(
    locationId: string,
    query: PaginateQuery,
  ): Promise<Paginated<any>>;

  getVoucherById(voucherId: string): Promise<any>;

  updateVoucher(
    voucherId: string,
    locationId: string,
    dto: UpdateLocationVoucherDto,
  ): Promise<any>;

  deleteVoucher(voucherId: string, locationId: string): Promise<void>;

  getActiveVouchersByLocation(
    locationId: string,
    query: PaginateQuery,
  ): Promise<Paginated<any>>;

  getAvailableVouchersByLocation(
    locationId: string,
    query: PaginateQuery,
  ): Promise<Paginated<any>>;

  getFreeAvailableVouchers(query: PaginateQuery): Promise<Paginated<any>>;
}
