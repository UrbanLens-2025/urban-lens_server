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
  LocationVoucherEntity,
  LocationVoucherType,
} from '@/modules/gamification/domain/LocationVoucher.entity';
import { LocationRepository } from '@/modules/business/infra/repository/Location.repository';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class LocationVoucherService implements ILocationVoucherService {
  constructor(
    private readonly locationVoucherRepository: LocationVoucherRepository,
    private readonly locationRepository: LocationRepository,
  ) {}

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
        // Public vouchers must have price point = 0
        if (dto.pricePoint !== undefined && dto.pricePoint !== 0) {
          throw new BadRequestException(
            'Public vouchers must have price point = 0 (free)',
          );
        }
        pricePoint = 0;
      } else {
        // Mission-only vouchers require explicit price point and must be > 0
        if (dto.pricePoint === undefined) {
          throw new BadRequestException(
            'Price point is required for mission-only vouchers',
          );
        }
        if (dto.pricePoint <= 0) {
          throw new BadRequestException(
            'Price point must be greater than 0 for mission-only vouchers',
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
    query: PaginateQuery,
  ): Promise<Paginated<any>> {
    try {
      return paginate(query, this.locationVoucherRepository.repo, {
        where: { locationId },
        sortableColumns: ['createdAt', 'pricePoint', 'startDate', 'endDate'],
        defaultSortBy: [['createdAt', 'DESC']],
        searchableColumns: ['title', 'voucherCode'],
        filterableColumns: {
          voucherType: true,
        },
      });
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
      const finalPricePoint =
        dto.pricePoint !== undefined ? dto.pricePoint : voucher.pricePoint;

      if (updatedVoucherType === LocationVoucherType.PUBLIC) {
        // Public vouchers must have price point = 0
        if (dto.pricePoint !== undefined && dto.pricePoint !== 0) {
          throw new BadRequestException(
            'Public vouchers must have price point = 0 (free)',
          );
        }
        dto.pricePoint = 0;
      } else {
        // Mission-only vouchers require price point > 0
        if (finalPricePoint === undefined || finalPricePoint <= 0) {
          throw new BadRequestException(
            'Price point must be greater than 0 for mission-only vouchers',
          );
        }
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
    query: PaginateQuery,
  ): Promise<Paginated<any>> {
    try {
      const now = new Date();
      const queryBuilder = this.locationVoucherRepository.repo
        .createQueryBuilder('voucher')
        .where('voucher.locationId = :locationId', { locationId })
        .andWhere('voucher.startDate <= :now', { now })
        .andWhere('voucher.endDate >= :now', { now });

      return paginate(query, queryBuilder, {
        sortableColumns: ['createdAt', 'pricePoint', 'startDate', 'endDate'],
        defaultSortBy: [['createdAt', 'DESC']],
        searchableColumns: ['title', 'voucherCode'],
        filterableColumns: {
          voucherType: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAvailableVouchersByLocation(
    locationId: string,
    query: PaginateQuery,
  ): Promise<Paginated<any>> {
    try {
      const now = new Date();
      const queryBuilder = this.locationVoucherRepository.repo
        .createQueryBuilder('voucher')
        .where('voucher.locationId = :locationId', { locationId })
        .andWhere('voucher.startDate <= :now', { now })
        .andWhere('voucher.endDate >= :now', { now })
        .andWhere('voucher.maxQuantity > 0');

      return paginate(query, queryBuilder, {
        sortableColumns: ['createdAt', 'pricePoint', 'startDate', 'endDate'],
        defaultSortBy: [['createdAt', 'DESC']],
        searchableColumns: ['title', 'voucherCode'],
        filterableColumns: {
          voucherType: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getFreeAvailableVouchers(
    query: PaginateQuery,
  ): Promise<Paginated<any>> {
    try {
      const now = new Date();
      const queryBuilder = this.locationVoucherRepository.repo
        .createQueryBuilder('voucher')
        .leftJoinAndSelect('voucher.location', 'location')
        .where('voucher.pricePoint = 0') // Free vouchers only
        .andWhere('voucher.startDate <= :now', { now })
        .andWhere('voucher.endDate >= :now', { now })
        .andWhere('voucher.maxQuantity > 0');

      return paginate(query, queryBuilder, {
        sortableColumns: ['createdAt', 'startDate', 'endDate'],
        defaultSortBy: [['createdAt', 'DESC']],
        searchableColumns: ['title', 'voucherCode'],
        filterableColumns: {
          voucherType: true,
          locationId: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAllAvailableVouchers(query: PaginateQuery): Promise<Paginated<any>> {
    try {
      const now = new Date();
      const queryBuilder = this.locationVoucherRepository.repo
        .createQueryBuilder('voucher')
        .leftJoinAndSelect('voucher.location', 'location')
        .where('voucher.startDate <= :now', { now })
        .andWhere('voucher.endDate >= :now', { now })
        .andWhere('voucher.maxQuantity > 0');

      return paginate(query, queryBuilder, {
        sortableColumns: ['createdAt', 'pricePoint', 'startDate', 'endDate'],
        defaultSortBy: [['createdAt', 'DESC']],
        searchableColumns: ['title', 'voucherCode'],
        filterableColumns: {
          voucherType: true,
          locationId: true,
          pricePoint: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
