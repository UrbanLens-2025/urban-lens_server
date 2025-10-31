import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ILocationVoucherService } from '../ILocationVoucher.service';
import { LocationVoucherRepository } from '@/modules/gamification/infra/repository/LocationVoucher.repository';
import { CreateLocationVoucherDto } from '@/common/dto/gamification/CreateLocationVoucher.dto';
import { UpdateLocationVoucherDto } from '@/common/dto/gamification/UpdateLocationVoucher.dto';
import {
  BaseService,
  PaginationParams,
  PaginationResult,
} from '@/common/services/base.service';
import {
  LocationVoucherEntity,
  LocationVoucherType,
} from '@/modules/gamification/domain/LocationVoucher.entity';
import { LocationRepository } from '@/modules/business/infra/repository/Location.repository';

@Injectable()
export class LocationVoucherService
  extends BaseService<LocationVoucherEntity>
  implements ILocationVoucherService
{
  constructor(
    private readonly locationVoucherRepository: LocationVoucherRepository,
    private readonly locationRepository: LocationRepository,
  ) {
    super(locationVoucherRepository.repo);
  }

  async createVoucher(
    locationId: string,
    dto: CreateLocationVoucherDto,
  ): Promise<any> {
    try {
      // Verify location exists
      const location = await this.locationRepository.repo.findOne({
        where: { id: locationId },
      });

      if (!location) {
        throw new NotFoundException('Location not found');
      }

      // Check if voucher code already exists for this location
      const existingVoucher = await this.locationVoucherRepository.repo.findOne(
        {
          where: { voucherCode: dto.voucherCode, locationId },
        },
      );

      if (existingVoucher) {
        throw new BadRequestException(
          `Voucher code '${dto.voucherCode}' already exists for this location`,
        );
      }

      // Validate date range
      const startDate = new Date(dto.startDate);
      const endDate = new Date(dto.endDate);
      const now = new Date();

      if (startDate >= endDate) {
        throw new BadRequestException('Start date must be before end date');
      }

      if (endDate <= now) {
        throw new BadRequestException('End date must be in the future');
      }

      // Determine voucher type and price point
      const voucherType = dto.voucherType || LocationVoucherType.PUBLIC;
      let pricePoint: number;

      if (voucherType === LocationVoucherType.PUBLIC) {
        // Public vouchers default to 0 price point
        pricePoint = dto.pricePoint !== undefined ? dto.pricePoint : 0;
      } else {
        // Mission-only vouchers require explicit price point
        if (dto.pricePoint === undefined) {
          throw new BadRequestException(
            'Price point is required for mission-only vouchers',
          );
        }
        pricePoint = dto.pricePoint;
      }

      // Create voucher
      const voucher = this.locationVoucherRepository.repo.create({
        locationId,
        title: dto.title,
        description: dto.description,
        voucherCode: dto.voucherCode,
        imageUrl: dto.imageUrl || null,
        pricePoint: pricePoint,
        maxQuantity: dto.maxQuantity,
        userRedeemedLimit: dto.userRedeemedLimit,
        voucherType: voucherType,
        startDate,
        endDate,
      });

      const savedVoucher =
        await this.locationVoucherRepository.repo.save(voucher);

      return {
        id: savedVoucher.id,
        locationId: savedVoucher.locationId,
        title: savedVoucher.title,
        description: savedVoucher.description,
        voucherCode: savedVoucher.voucherCode,
        imageUrl: savedVoucher.imageUrl,
        pricePoint: savedVoucher.pricePoint,
        maxQuantity: savedVoucher.maxQuantity,
        userRedeemedLimit: savedVoucher.userRedeemedLimit,
        voucherType: savedVoucher.voucherType,
        startDate: savedVoucher.startDate,
        endDate: savedVoucher.endDate,
        createdAt: savedVoucher.createdAt,
        updatedAt: savedVoucher.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async getVouchersByLocation(
    locationId: string,
    params: PaginationParams = {},
  ): Promise<PaginationResult<any>> {
    try {
      const { page, limit, skip } = this.normalizePaginationParams(params);

      const [vouchers, total] =
        await this.locationVoucherRepository.repo.findAndCount({
          where: { locationId },
          order: { createdAt: 'DESC' },
          skip,
          take: limit,
        });

      return {
        data: vouchers,
        meta: this.buildPaginationMeta(page, limit, total),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getVoucherById(voucherId: string): Promise<any> {
    try {
      const voucher = await this.locationVoucherRepository.repo.findOne({
        where: { id: voucherId },
        relations: ['location'],
      });

      if (!voucher) {
        throw new NotFoundException('Voucher not found');
      }

      return voucher;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async updateVoucher(
    voucherId: string,
    locationId: string,
    dto: UpdateLocationVoucherDto,
  ): Promise<any> {
    try {
      const voucher = await this.locationVoucherRepository.repo.findOne({
        where: { id: voucherId, locationId },
      });

      if (!voucher) {
        throw new NotFoundException('Voucher not found');
      }

      // Check if voucher code is being changed and if it already exists for this location
      if (dto.voucherCode && dto.voucherCode !== voucher.voucherCode) {
        const existingVoucher =
          await this.locationVoucherRepository.repo.findOne({
            where: { voucherCode: dto.voucherCode, locationId },
          });

        if (existingVoucher && existingVoucher.id !== voucherId) {
          throw new BadRequestException(
            `Voucher code '${dto.voucherCode}' already exists for this location`,
          );
        }
      }

      // Validate date range if provided
      if (dto.startDate || dto.endDate) {
        const startDate = dto.startDate
          ? new Date(dto.startDate)
          : voucher.startDate;
        const endDate = dto.endDate ? new Date(dto.endDate) : voucher.endDate;

        if (startDate >= endDate) {
          throw new BadRequestException('Start date must be before end date');
        }
      }

      // Handle price point based on voucher type
      const updatedVoucherType = dto.voucherType ?? voucher.voucherType;

      if (
        updatedVoucherType === LocationVoucherType.PUBLIC &&
        dto.pricePoint === undefined
      ) {
        // If changing to public and no price point specified, set to 0
        dto.pricePoint = 0;
      } else if (
        updatedVoucherType === LocationVoucherType.MISSION_ONLY &&
        dto.pricePoint === undefined &&
        (!voucher.pricePoint || voucher.pricePoint === 0)
      ) {
        // If changing to mission-only and no price point specified, require it
        throw new BadRequestException(
          'Price point is required for mission-only vouchers',
        );
      }

      // Update voucher
      Object.assign(voucher, dto);
      const updatedVoucher =
        await this.locationVoucherRepository.repo.save(voucher);

      return {
        id: updatedVoucher.id,
        locationId: updatedVoucher.locationId,
        title: updatedVoucher.title,
        description: updatedVoucher.description,
        voucherCode: updatedVoucher.voucherCode,
        imageUrl: updatedVoucher.imageUrl,
        pricePoint: updatedVoucher.pricePoint,
        maxQuantity: updatedVoucher.maxQuantity,
        userRedeemedLimit: updatedVoucher.userRedeemedLimit,
        voucherType: updatedVoucher.voucherType,
        startDate: updatedVoucher.startDate,
        endDate: updatedVoucher.endDate,
        createdAt: updatedVoucher.createdAt,
        updatedAt: updatedVoucher.updatedAt,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async deleteVoucher(voucherId: string, locationId: string): Promise<void> {
    try {
      const voucher = await this.locationVoucherRepository.repo.findOne({
        where: { id: voucherId, locationId },
      });

      if (!voucher) {
        throw new NotFoundException('Voucher not found');
      }

      await this.locationVoucherRepository.repo.remove(voucher);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async getActiveVouchersByLocation(
    locationId: string,
    params: PaginationParams = {},
  ): Promise<PaginationResult<any>> {
    try {
      const { page, limit, skip } = this.normalizePaginationParams(params);
      const now = new Date();

      const [vouchers, total] = await this.locationVoucherRepository.repo
        .createQueryBuilder('voucher')
        .where('voucher.locationId = :locationId', { locationId })
        .andWhere('voucher.startDate <= :now', { now })
        .andWhere('voucher.endDate >= :now', { now })
        .orderBy('voucher.createdAt', 'DESC')
        .offset(skip)
        .limit(limit)
        .getManyAndCount();

      return {
        data: vouchers,
        meta: this.buildPaginationMeta(page, limit, total),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAvailableVouchersByLocation(
    locationId: string,
    params: PaginationParams = {},
  ): Promise<PaginationResult<any>> {
    try {
      const { page, limit, skip } = this.normalizePaginationParams(params);
      const now = new Date();

      const [vouchers, total] = await this.locationVoucherRepository.repo
        .createQueryBuilder('voucher')
        .where('voucher.locationId = :locationId', { locationId })
        .andWhere('voucher.startDate <= :now', { now })
        .andWhere('voucher.endDate >= :now', { now })
        .andWhere('voucher.maxQuantity > 0')
        .orderBy('voucher.createdAt', 'DESC')
        .offset(skip)
        .limit(limit)
        .getManyAndCount();

      return {
        data: vouchers,
        meta: this.buildPaginationMeta(page, limit, total),
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  private normalizePaginationParams(params: PaginationParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  private buildPaginationMeta(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}
