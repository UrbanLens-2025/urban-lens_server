import { CreateLocationVoucherDto } from '@/common/dto/gamification/CreateLocationVoucher.dto';
import { UpdateLocationVoucherDto } from '@/common/dto/gamification/UpdateLocationVoucher.dto';
import {
  PaginationParams,
  PaginationResult,
} from '@/common/services/base.service';

export const ILocationVoucherService = Symbol('ILocationVoucherService');

export interface ILocationVoucherService {
  createVoucher(
    locationId: string,
    dto: CreateLocationVoucherDto,
  ): Promise<any>;

  getVouchersByLocation(
    locationId: string,
    params?: PaginationParams,
  ): Promise<PaginationResult<any>>;

  getVoucherById(voucherId: string): Promise<any>;

  updateVoucher(
    voucherId: string,
    locationId: string,
    dto: UpdateLocationVoucherDto,
  ): Promise<any>;

  deleteVoucher(voucherId: string, locationId: string): Promise<void>;

  getActiveVouchersByLocation(
    locationId: string,
    params?: PaginationParams,
  ): Promise<PaginationResult<any>>;

  getAvailableVouchersByLocation(
    locationId: string,
    params?: PaginationParams,
  ): Promise<PaginationResult<any>>;
}
