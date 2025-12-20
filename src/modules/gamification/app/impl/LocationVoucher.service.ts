import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ILocationVoucherService,
  ILocationVoucherService_QueryConfig,
} from '../ILocationVoucher.service';
import { LocationVoucherRepository } from '@/modules/gamification/infra/repository/LocationVoucher.repository';
import { CreateLocationVoucherDto } from '@/common/dto/gamification/CreateLocationVoucher.dto';
import { UpdateLocationVoucherDto } from '@/common/dto/gamification/UpdateLocationVoucher.dto';
import {
  LocationVoucherEntity,
  LocationVoucherType,
} from '@/modules/gamification/domain/LocationVoucher.entity';
import { LocationRepository } from '@/modules/business/infra/repository/Location.repository';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { UserLocationVoucherExchangeHistoryRepository } from '@/modules/gamification/infra/repository/UserLocationVoucherExchangeHistory.repository';
import { UserLocationVoucherExchangeHistoryEntity } from '@/modules/gamification/domain/UserLocationVoucherExchangeHistory.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class LocationVoucherService implements ILocationVoucherService {
  private readonly logger = new Logger(LocationVoucherService.name);
  private readonly exchangeHistoryTableName: string;

  constructor(
    private readonly locationVoucherRepository: LocationVoucherRepository,
    private readonly locationRepository: LocationRepository,
    private readonly userLocationVoucherExchangeHistoryRepository: UserLocationVoucherExchangeHistoryRepository,
    private readonly dataSource: DataSource,
  ) {
    // Get table name from entity metadata
    const metadata = this.dataSource.getMetadata(
      UserLocationVoucherExchangeHistoryEntity,
    );
    this.exchangeHistoryTableName = metadata.tableName;
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
      const result = await paginate(
        query,
        this.locationVoucherRepository.repo,
        {
          where: { locationId },
          sortableColumns: ['createdAt', 'pricePoint', 'startDate', 'endDate'],
          defaultSortBy: [['createdAt', 'DESC']],
          searchableColumns: ['title', 'voucherCode'],
          filterableColumns: {
            voucherType: true,
          },
        },
      );

      // Calculate statistics for all vouchers
      const voucherIds = result.data.map((voucher: any) => voucher.id);
      const usedCounts =
        voucherIds.length > 0
          ? await this.userLocationVoucherExchangeHistoryRepository.repo
              .createQueryBuilder('history')
              .select('history.voucherId', 'voucherId')
              .addSelect('COUNT(history.id)', 'count')
              .where('history.voucherId IN (:...voucherIds)', { voucherIds })
              .andWhere('history.usedAt IS NOT NULL')
              .groupBy('history.voucherId')
              .getRawMany()
          : [];

      const usedCountMap = new Map<string, number>();
      usedCounts.forEach((item: any) => {
        usedCountMap.set(item.voucherId, parseInt(item.count, 10));
      });

      // Add statistics to each voucher
      const vouchersWithStats = result.data.map((voucher: any) => {
        const total = voucher.maxQuantity || 0;
        const used = usedCountMap.get(voucher.id) || 0;
        const remaining = Math.max(0, total - used);

        return {
          ...voucher,
          statistics: {
            total,
            used,
            remaining,
          },
        };
      });

      return {
        ...result,
        data: vouchersWithStats,
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

      // Calculate statistics
      const total = voucher.maxQuantity || 0;
      const used = await this.userLocationVoucherExchangeHistoryRepository.repo
        .createQueryBuilder('history')
        .where('history.voucherId = :voucherId', { voucherId })
        .andWhere('history.usedAt IS NOT NULL')
        .getCount();
      const remaining = Math.max(0, total - used);

      return {
        ...voucher,
        statistics: {
          total,
          used,
          remaining,
        },
      };
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
    userId?: string,
  ): Promise<Paginated<any>> {
    try {
      const now = new Date();

      const queryBuilder = this.locationVoucherRepository.repo
        .createQueryBuilder('voucher')
        .leftJoin('voucher.location', 'location')
        .select([
          'voucher.id as id',
          'voucher.title as title',
          'voucher.description as description',
          'voucher.voucher_code as voucherCode',
          'voucher.voucher_type as voucherType',
          'voucher.price_point as pricePoint',
          'voucher.start_date as startDate',
          'voucher.end_date as endDate',
          'voucher.max_quantity as maxQuantity',
          'voucher.user_redeemed_limit as userRedeemedLimit',
          'voucher.image_url as imageUrl',
          'voucher.created_at as createdAt',
          'location.id as location_id',
          'location.name as location_name',
        ])
        .where('voucher.location_id = :locationId', { locationId })
        .andWhere('voucher.start_date <= :now', { now })
        .andWhere('voucher.end_date >= :now', { now })
        .andWhere('voucher.max_quantity > 0')
        .andWhere('voucher.max_quantity IS NOT NULL');

      // Get all vouchers first (before pagination)
      const allVouchers = await queryBuilder.getRawMany();

      // Get exchange counts for all vouchers
      const voucherIds = allVouchers.map((v: any) => v.id);
      const exchangeCounts =
        voucherIds.length > 0
          ? await this.userLocationVoucherExchangeHistoryRepository.repo
              .createQueryBuilder('exchange')
              .select('exchange.voucher_id', 'voucherId')
              .addSelect('COUNT(exchange.id)', 'count')
              .where('exchange.voucher_id IN (:...voucherIds)', { voucherIds })
              .groupBy('exchange.voucher_id')
              .getRawMany()
          : [];

      const exchangeCountMap = new Map(
        exchangeCounts.map((e: any) => [e.voucherId, parseInt(e.count, 10)]),
      );

      // Get user exchange counts if userId provided
      let userExchangeCountMap = new Map<string, number>();
      if (userId && voucherIds.length > 0) {
        const userExchangeCounts =
          await this.userLocationVoucherExchangeHistoryRepository.repo
            .createQueryBuilder('exchange')
            .select('exchange.voucher_id', 'voucherId')
            .addSelect('COUNT(exchange.id)', 'count')
            .where('exchange.voucher_id IN (:...voucherIds)', { voucherIds })
            .andWhere('exchange.user_profile_id = :userId', { userId })
            .groupBy('exchange.voucher_id')
            .getRawMany();

        userExchangeCountMap = new Map(
          userExchangeCounts.map((e: any) => [
            e.voucherId,
            parseInt(e.count, 10),
          ]),
        );
      }

      // Filter vouchers with remaining quantity and user limit
      const filteredVouchers = allVouchers.filter((voucher: any) => {
        const redeemedCount = exchangeCountMap.get(voucher.id) || 0;

        // Try to find maxQuantity in all possible keys (case-insensitive)
        // TypeORM getRawMany() may return keys as alias, column name, or lowercase depending on database driver
        const allKeys = Object.keys(voucher);
        const maxQuantityKey = allKeys.find(
          (key) =>
            key === 'maxQuantity' ||
            key === 'max_quantity' ||
            key.toLowerCase() === 'maxquantity' ||
            key.toLowerCase() === 'max_quantity',
        );
        const maxQuantityRaw = maxQuantityKey
          ? voucher[maxQuantityKey]
          : (voucher.maxQuantity ?? voucher.max_quantity);

        let maxQuantity = 0;

        if (maxQuantityRaw !== null && maxQuantityRaw !== undefined) {
          if (typeof maxQuantityRaw === 'string') {
            maxQuantity = parseInt(maxQuantityRaw, 10);
            if (isNaN(maxQuantity)) maxQuantity = 0;
          } else {
            maxQuantity = Number(maxQuantityRaw);
            if (isNaN(maxQuantity)) maxQuantity = 0;
          }
        }

        // If maxQuantity is 0 or null, skip this voucher (should not happen due to SQL filter, but safety check)
        if (maxQuantity <= 0) {
          this.logger.debug(
            `Voucher ${voucher.id}: Invalid maxQuantity (maxQuantity: ${maxQuantity}, maxQuantityRaw: ${maxQuantityRaw}, maxQuantityKey: ${maxQuantityKey}, voucher keys: ${allKeys.join(', ')})`,
          );
          return false;
        }

        const hasRemainingQuantity = maxQuantity > redeemedCount;

        if (!hasRemainingQuantity) {
          this.logger.debug(
            `Voucher ${voucher.id}: No remaining quantity (maxQuantity: ${maxQuantity}, maxQuantityRaw: ${maxQuantityRaw}, redeemed: ${redeemedCount})`,
          );
          return false;
        }

        // If userId provided, filter out vouchers where user has reached redemption limit
        if (userId) {
          const userRedeemedCount = userExchangeCountMap.get(voucher.id) || 0;
          const userRedeemedLimit = voucher.userRedeemedLimit || 0;
          if (userRedeemedLimit > 0 && userRedeemedCount >= userRedeemedLimit) {
            this.logger.debug(
              `Voucher ${voucher.id}: User reached limit (limit: ${userRedeemedLimit}, redeemed: ${userRedeemedCount})`,
            );
            return false;
          }
        }

        return true;
      });
      this.logger.debug(
        `getAvailableVouchersByLocation: Filtered to ${filteredVouchers.length} vouchers`,
      );

      // Apply pagination manually
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;
      const paginatedVouchers = filteredVouchers.slice(skip, skip + limit);
      this.logger.debug(
        `getAvailableVouchersByLocation: Paginated to ${paginatedVouchers.length} vouchers (page: ${page}, limit: ${limit})`,
      );

      // Map response
      const mappedData = paginatedVouchers.map((voucher: any): any => {
        const voucherId = voucher.id;
        const userRedeemedCount = userId
          ? userExchangeCountMap.get(voucherId) || 0
          : 0;

        // Find maxQuantity using same logic as filter
        const allKeys = Object.keys(voucher);
        const maxQuantityKey = allKeys.find(
          (key) =>
            key === 'maxQuantity' ||
            key === 'max_quantity' ||
            key.toLowerCase() === 'maxquantity' ||
            key.toLowerCase() === 'max_quantity',
        );
        const maxQuantityRaw = maxQuantityKey
          ? voucher[maxQuantityKey]
          : (voucher.maxQuantity ?? voucher.max_quantity);
        let maxQuantity = 0;
        if (maxQuantityRaw !== null && maxQuantityRaw !== undefined) {
          if (typeof maxQuantityRaw === 'string') {
            maxQuantity = parseInt(maxQuantityRaw, 10);
            if (isNaN(maxQuantity)) maxQuantity = 0;
          } else {
            maxQuantity = Number(maxQuantityRaw);
            if (isNaN(maxQuantity)) maxQuantity = 0;
          }
        }

        // Find userRedeemedLimit using same logic
        const userRedeemedLimitKey = allKeys.find(
          (key) =>
            key === 'userRedeemedLimit' ||
            key === 'user_redeemed_limit' ||
            key.toLowerCase() === 'userredeemedlimit' ||
            key.toLowerCase() === 'user_redeemed_limit',
        );
        const userRedeemedLimitRaw = userRedeemedLimitKey
          ? voucher[userRedeemedLimitKey]
          : (voucher.userRedeemedLimit ?? voucher.user_redeemed_limit);
        const userRedeemedLimit =
          userRedeemedLimitRaw !== null && userRedeemedLimitRaw !== undefined
            ? typeof userRedeemedLimitRaw === 'string'
              ? parseInt(userRedeemedLimitRaw, 10) || 0
              : Number(userRedeemedLimitRaw) || 0
            : 0;

        // Find pricePoint using same logic
        const pricePointKey = allKeys.find(
          (key) =>
            key === 'pricePoint' ||
            key === 'price_point' ||
            key.toLowerCase() === 'pricepoint' ||
            key.toLowerCase() === 'price_point',
        );
        const pricePointRaw = pricePointKey
          ? voucher[pricePointKey]
          : (voucher.pricePoint ?? voucher.price_point);
        const pricePoint =
          pricePointRaw !== null && pricePointRaw !== undefined
            ? typeof pricePointRaw === 'string'
              ? parseInt(pricePointRaw, 10) || 0
              : Number(pricePointRaw) || 0
            : 0;

        // Find startDate using same logic
        const startDateKey = allKeys.find(
          (key) =>
            key === 'startDate' ||
            key === 'start_date' ||
            key.toLowerCase() === 'startdate' ||
            key.toLowerCase() === 'start_date',
        );
        const startDate = startDateKey
          ? voucher[startDateKey]
          : (voucher.startDate ?? voucher.start_date);

        // Find endDate using same logic
        const endDateKey = allKeys.find(
          (key) =>
            key === 'endDate' ||
            key === 'end_date' ||
            key.toLowerCase() === 'enddate' ||
            key.toLowerCase() === 'end_date',
        );
        const endDate = endDateKey
          ? voucher[endDateKey]
          : (voucher.endDate ?? voucher.end_date);

        const isExchanged =
          userId &&
          userRedeemedLimit > 0 &&
          userRedeemedCount >= userRedeemedLimit;

        return {
          id: voucherId,
          title: voucher.title,
          description: voucher.description,
          voucherCode: voucher.voucherCode || voucher.voucher_code,
          voucherType: voucher.voucherType || voucher.voucher_type,
          pricePoint,
          startDate,
          endDate,
          maxQuantity,
          userRedeemedLimit,
          imageUrl: voucher.imageUrl || voucher.image_url,
          createdAt: voucher.createdAt || voucher.created_at,
          location: voucher.location_id
            ? {
                id: voucher.location_id,
                name: voucher.location_name,
              }
            : undefined,
          isExchanged: isExchanged || false,
        };
      });

      return {
        data: mappedData,
        meta: {
          itemsPerPage: limit,
          totalItems: filteredVouchers.length,
          currentPage: page,
          totalPages: Math.ceil(filteredVouchers.length / limit),
        },
        links: {
          first: `?page=1&limit=${limit}`,
          last: `?page=${Math.ceil(filteredVouchers.length / limit)}&limit=${limit}`,
          next:
            page < Math.ceil(filteredVouchers.length / limit)
              ? `?page=${page + 1}&limit=${limit}`
              : null,
          previous: page > 1 ? `?page=${page - 1}&limit=${limit}` : null,
        },
      } as Paginated<any>;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getFreeAvailableVouchers(
    query: PaginateQuery,
    userId?: string,
  ): Promise<Paginated<any>> {
    try {
      const now = new Date();

      const queryBuilder = this.locationVoucherRepository.repo
        .createQueryBuilder('voucher')
        .leftJoin('voucher.location', 'location')
        .select([
          'voucher.id as id',
          'voucher.title as title',
          'voucher.description as description',
          'voucher.voucher_code as voucherCode',
          'voucher.voucher_type as voucherType',
          'voucher.price_point as pricePoint',
          'voucher.start_date as startDate',
          'voucher.end_date as endDate',
          'voucher.max_quantity as maxQuantity',
          'voucher.user_redeemed_limit as userRedeemedLimit',
          'voucher.image_url as imageUrl',
          'voucher.created_at as createdAt',
          'location.id as location_id',
          'location.name as location_name',
        ])
        .where('voucher.price_point = 0') // Free vouchers only
        .andWhere('voucher.start_date <= :now', { now })
        .andWhere('voucher.end_date >= :now', { now })
        .andWhere('voucher.max_quantity > 0')
        .andWhere('voucher.max_quantity IS NOT NULL');

      // Get all vouchers first (before pagination)
      const allVouchers = await queryBuilder.getRawMany();

      // Get exchange counts for all vouchers
      const voucherIds = allVouchers.map((v: any) => v.id);
      const exchangeCounts =
        voucherIds.length > 0
          ? await this.userLocationVoucherExchangeHistoryRepository.repo
              .createQueryBuilder('exchange')
              .select('exchange.voucher_id', 'voucherId')
              .addSelect('COUNT(exchange.id)', 'count')
              .where('exchange.voucher_id IN (:...voucherIds)', { voucherIds })
              .groupBy('exchange.voucher_id')
              .getRawMany()
          : [];

      const exchangeCountMap = new Map(
        exchangeCounts.map((e: any) => [e.voucherId, parseInt(e.count, 10)]),
      );

      // Get user exchange counts if userId provided
      let userExchangeCountMap = new Map<string, number>();
      if (userId && voucherIds.length > 0) {
        const userExchangeCounts =
          await this.userLocationVoucherExchangeHistoryRepository.repo
            .createQueryBuilder('exchange')
            .select('exchange.voucher_id', 'voucherId')
            .addSelect('COUNT(exchange.id)', 'count')
            .where('exchange.voucher_id IN (:...voucherIds)', { voucherIds })
            .andWhere('exchange.user_profile_id = :userId', { userId })
            .groupBy('exchange.voucher_id')
            .getRawMany();

        userExchangeCountMap = new Map(
          userExchangeCounts.map((e: any) => [
            e.voucherId,
            parseInt(e.count, 10),
          ]),
        );
      }

      // Filter vouchers with remaining quantity and user limit
      const filteredVouchers = allVouchers.filter((voucher: any) => {
        const redeemedCount = exchangeCountMap.get(voucher.id) || 0;

        // Try to find maxQuantity in all possible keys (case-insensitive)
        // TypeORM getRawMany() may return keys as alias, column name, or lowercase depending on database driver
        const allKeys = Object.keys(voucher);
        const maxQuantityKey = allKeys.find(
          (key) =>
            key === 'maxQuantity' ||
            key === 'max_quantity' ||
            key.toLowerCase() === 'maxquantity' ||
            key.toLowerCase() === 'max_quantity',
        );
        const maxQuantityRaw = maxQuantityKey
          ? voucher[maxQuantityKey]
          : (voucher.maxQuantity ?? voucher.max_quantity);

        let maxQuantity = 0;

        if (maxQuantityRaw !== null && maxQuantityRaw !== undefined) {
          if (typeof maxQuantityRaw === 'string') {
            maxQuantity = parseInt(maxQuantityRaw, 10);
            if (isNaN(maxQuantity)) maxQuantity = 0;
          } else {
            maxQuantity = Number(maxQuantityRaw);
            if (isNaN(maxQuantity)) maxQuantity = 0;
          }
        }

        // If maxQuantity is 0 or null, skip this voucher (should not happen due to SQL filter, but safety check)
        if (maxQuantity <= 0) {
          this.logger.debug(
            `Voucher ${voucher.id}: Invalid maxQuantity (maxQuantity: ${maxQuantity}, maxQuantityRaw: ${maxQuantityRaw}, maxQuantityKey: ${maxQuantityKey}, voucher keys: ${allKeys.join(', ')})`,
          );
          return false;
        }

        const hasRemainingQuantity = maxQuantity > redeemedCount;

        if (!hasRemainingQuantity) {
          this.logger.debug(
            `Voucher ${voucher.id}: No remaining quantity (maxQuantity: ${maxQuantity}, maxQuantityRaw: ${maxQuantityRaw}, redeemed: ${redeemedCount})`,
          );
          return false;
        }

        // If userId provided, filter out vouchers where user has reached redemption limit
        if (userId) {
          const userRedeemedCount = userExchangeCountMap.get(voucher.id) || 0;
          const userRedeemedLimit = voucher.userRedeemedLimit || 0;
          if (userRedeemedLimit > 0 && userRedeemedCount >= userRedeemedLimit) {
            this.logger.debug(
              `Voucher ${voucher.id}: User reached limit (limit: ${userRedeemedLimit}, redeemed: ${userRedeemedCount})`,
            );
            return false;
          }
        }

        return true;
      });
      this.logger.debug(
        `getFreeAvailableVouchers: Filtered to ${filteredVouchers.length} vouchers`,
      );

      // Apply pagination manually
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;
      const paginatedVouchers = filteredVouchers.slice(skip, skip + limit);
      this.logger.debug(
        `getFreeAvailableVouchers: Paginated to ${paginatedVouchers.length} vouchers (page: ${page}, limit: ${limit})`,
      );

      // Map response
      const mappedData = paginatedVouchers.map((voucher: any): any => {
        const voucherId = voucher.id;
        const userRedeemedCount = userId
          ? userExchangeCountMap.get(voucherId) || 0
          : 0;

        // Find maxQuantity using same logic as filter
        const allKeys = Object.keys(voucher);
        const maxQuantityKey = allKeys.find(
          (key) =>
            key === 'maxQuantity' ||
            key === 'max_quantity' ||
            key.toLowerCase() === 'maxquantity' ||
            key.toLowerCase() === 'max_quantity',
        );
        const maxQuantityRaw = maxQuantityKey
          ? voucher[maxQuantityKey]
          : (voucher.maxQuantity ?? voucher.max_quantity);
        let maxQuantity = 0;
        if (maxQuantityRaw !== null && maxQuantityRaw !== undefined) {
          if (typeof maxQuantityRaw === 'string') {
            maxQuantity = parseInt(maxQuantityRaw, 10);
            if (isNaN(maxQuantity)) maxQuantity = 0;
          } else {
            maxQuantity = Number(maxQuantityRaw);
            if (isNaN(maxQuantity)) maxQuantity = 0;
          }
        }

        // Find userRedeemedLimit using same logic
        const userRedeemedLimitKey = allKeys.find(
          (key) =>
            key === 'userRedeemedLimit' ||
            key === 'user_redeemed_limit' ||
            key.toLowerCase() === 'userredeemedlimit' ||
            key.toLowerCase() === 'user_redeemed_limit',
        );
        const userRedeemedLimitRaw = userRedeemedLimitKey
          ? voucher[userRedeemedLimitKey]
          : (voucher.userRedeemedLimit ?? voucher.user_redeemed_limit);
        const userRedeemedLimit =
          userRedeemedLimitRaw !== null && userRedeemedLimitRaw !== undefined
            ? typeof userRedeemedLimitRaw === 'string'
              ? parseInt(userRedeemedLimitRaw, 10) || 0
              : Number(userRedeemedLimitRaw) || 0
            : 0;

        // Find pricePoint using same logic
        const pricePointKey = allKeys.find(
          (key) =>
            key === 'pricePoint' ||
            key === 'price_point' ||
            key.toLowerCase() === 'pricepoint' ||
            key.toLowerCase() === 'price_point',
        );
        const pricePointRaw = pricePointKey
          ? voucher[pricePointKey]
          : (voucher.pricePoint ?? voucher.price_point);
        const pricePoint =
          pricePointRaw !== null && pricePointRaw !== undefined
            ? typeof pricePointRaw === 'string'
              ? parseInt(pricePointRaw, 10) || 0
              : Number(pricePointRaw) || 0
            : 0;

        // Find startDate using same logic
        const startDateKey = allKeys.find(
          (key) =>
            key === 'startDate' ||
            key === 'start_date' ||
            key.toLowerCase() === 'startdate' ||
            key.toLowerCase() === 'start_date',
        );
        const startDate = startDateKey
          ? voucher[startDateKey]
          : (voucher.startDate ?? voucher.start_date);

        // Find endDate using same logic
        const endDateKey = allKeys.find(
          (key) =>
            key === 'endDate' ||
            key === 'end_date' ||
            key.toLowerCase() === 'enddate' ||
            key.toLowerCase() === 'end_date',
        );
        const endDate = endDateKey
          ? voucher[endDateKey]
          : (voucher.endDate ?? voucher.end_date);

        const isExchanged =
          userId &&
          userRedeemedLimit > 0 &&
          userRedeemedCount >= userRedeemedLimit;

        return {
          id: voucherId,
          title: voucher.title,
          description: voucher.description,
          voucherCode: voucher.voucherCode || voucher.voucher_code,
          voucherType: voucher.voucherType || voucher.voucher_type,
          pricePoint,
          startDate,
          endDate,
          maxQuantity,
          userRedeemedLimit,
          imageUrl: voucher.imageUrl || voucher.image_url,
          createdAt: voucher.createdAt || voucher.created_at,
          location: voucher.location_id
            ? {
                id: voucher.location_id,
                name: voucher.location_name,
              }
            : undefined,
          isExchanged: isExchanged || false,
        };
      });

      return {
        data: mappedData,
        meta: {
          itemsPerPage: limit,
          totalItems: filteredVouchers.length,
          currentPage: page,
          totalPages: Math.ceil(filteredVouchers.length / limit),
        },
        links: {
          first: `?page=1&limit=${limit}`,
          last: `?page=${Math.ceil(filteredVouchers.length / limit)}&limit=${limit}`,
          next:
            page < Math.ceil(filteredVouchers.length / limit)
              ? `?page=${page + 1}&limit=${limit}`
              : null,
          previous: page > 1 ? `?page=${page - 1}&limit=${limit}` : null,
        },
      } as Paginated<any>;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAllAvailableVouchers(
    query: PaginateQuery,
    userId?: string,
  ): Promise<Paginated<any>> {
    try {
      const now = new Date();

      const queryBuilder = this.locationVoucherRepository.repo
        .createQueryBuilder('voucher')
        .leftJoin('voucher.location', 'location')
        .select([
          'voucher.id as id',
          'voucher.title as title',
          'voucher.description as description',
          'voucher.voucher_code as voucherCode',
          'voucher.voucher_type as voucherType',
          'voucher.price_point as pricePoint',
          'voucher.start_date as startDate',
          'voucher.end_date as endDate',
          'voucher.max_quantity as maxQuantity',
          'voucher.user_redeemed_limit as userRedeemedLimit',
          'voucher.image_url as imageUrl',
          'voucher.created_at as createdAt',
          'location.id as location_id',
          'location.name as location_name',
        ])
        .where('voucher.start_date <= :now', { now })
        .andWhere('voucher.end_date >= :now', { now })
        .andWhere('voucher.max_quantity > 0')
        .andWhere('voucher.max_quantity IS NOT NULL');

      // Get all vouchers first (before pagination)
      const allVouchers = await queryBuilder.getRawMany();

      // Get exchange counts for all vouchers
      const voucherIds = allVouchers.map((v: any) => v.id);
      const exchangeCounts =
        voucherIds.length > 0
          ? await this.userLocationVoucherExchangeHistoryRepository.repo
              .createQueryBuilder('exchange')
              .select('exchange.voucher_id', 'voucherId')
              .addSelect('COUNT(exchange.id)', 'count')
              .where('exchange.voucher_id IN (:...voucherIds)', { voucherIds })
              .groupBy('exchange.voucher_id')
              .getRawMany()
          : [];

      const exchangeCountMap = new Map(
        exchangeCounts.map((e: any) => [e.voucherId, parseInt(e.count, 10)]),
      );

      // Get user exchange counts if userId provided
      let userExchangeCountMap = new Map<string, number>();
      if (userId && voucherIds.length > 0) {
        const userExchangeCounts =
          await this.userLocationVoucherExchangeHistoryRepository.repo
            .createQueryBuilder('exchange')
            .select('exchange.voucher_id', 'voucherId')
            .addSelect('COUNT(exchange.id)', 'count')
            .where('exchange.voucher_id IN (:...voucherIds)', { voucherIds })
            .andWhere('exchange.user_profile_id = :userId', { userId })
            .groupBy('exchange.voucher_id')
            .getRawMany();

        userExchangeCountMap = new Map(
          userExchangeCounts.map((e: any) => [
            e.voucherId,
            parseInt(e.count, 10),
          ]),
        );
      }

      // Filter vouchers with remaining quantity and user limit
      const filteredVouchers = allVouchers.filter((voucher: any) => {
        const redeemedCount = exchangeCountMap.get(voucher.id) || 0;

        // Try to find maxQuantity in all possible keys (case-insensitive)
        // TypeORM getRawMany() may return keys as alias, column name, or lowercase depending on database driver
        const allKeys = Object.keys(voucher);
        const maxQuantityKey = allKeys.find(
          (key) =>
            key === 'maxQuantity' ||
            key === 'max_quantity' ||
            key.toLowerCase() === 'maxquantity' ||
            key.toLowerCase() === 'max_quantity',
        );
        const maxQuantityRaw = maxQuantityKey
          ? voucher[maxQuantityKey]
          : (voucher.maxQuantity ?? voucher.max_quantity);

        let maxQuantity = 0;

        if (maxQuantityRaw !== null && maxQuantityRaw !== undefined) {
          if (typeof maxQuantityRaw === 'string') {
            maxQuantity = parseInt(maxQuantityRaw, 10);
            if (isNaN(maxQuantity)) maxQuantity = 0;
          } else {
            maxQuantity = Number(maxQuantityRaw);
            if (isNaN(maxQuantity)) maxQuantity = 0;
          }
        }

        // If maxQuantity is 0 or null, skip this voucher (should not happen due to SQL filter, but safety check)
        if (maxQuantity <= 0) {
          this.logger.debug(
            `Voucher ${voucher.id}: Invalid maxQuantity (maxQuantity: ${maxQuantity}, maxQuantityRaw: ${maxQuantityRaw}, maxQuantityKey: ${maxQuantityKey}, voucher keys: ${allKeys.join(', ')})`,
          );
          return false;
        }

        const hasRemainingQuantity = maxQuantity > redeemedCount;

        if (!hasRemainingQuantity) {
          this.logger.debug(
            `Voucher ${voucher.id}: No remaining quantity (maxQuantity: ${maxQuantity}, maxQuantityRaw: ${maxQuantityRaw}, redeemed: ${redeemedCount})`,
          );
          return false;
        }

        // If userId provided, filter out vouchers where user has reached redemption limit
        if (userId) {
          const userRedeemedCount = userExchangeCountMap.get(voucher.id) || 0;
          const userRedeemedLimit = voucher.userRedeemedLimit || 0;
          if (userRedeemedLimit > 0 && userRedeemedCount >= userRedeemedLimit) {
            this.logger.debug(
              `Voucher ${voucher.id}: User reached limit (limit: ${userRedeemedLimit}, redeemed: ${userRedeemedCount})`,
            );
            return false;
          }
        }

        return true;
      });
      this.logger.debug(
        `getAllAvailableVouchers: Filtered to ${filteredVouchers.length} vouchers`,
      );

      // Apply pagination manually
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;
      const paginatedVouchers = filteredVouchers.slice(skip, skip + limit);
      this.logger.debug(
        `getAllAvailableVouchers: Paginated to ${paginatedVouchers.length} vouchers (page: ${page}, limit: ${limit})`,
      );

      // Map response
      const mappedData = paginatedVouchers.map((voucher: any): any => {
        const voucherId = voucher.id;
        const userRedeemedCount = userId
          ? userExchangeCountMap.get(voucherId) || 0
          : 0;

        // Find maxQuantity using same logic as filter
        const allKeys = Object.keys(voucher);
        const maxQuantityKey = allKeys.find(
          (key) =>
            key === 'maxQuantity' ||
            key === 'max_quantity' ||
            key.toLowerCase() === 'maxquantity' ||
            key.toLowerCase() === 'max_quantity',
        );
        const maxQuantityRaw = maxQuantityKey
          ? voucher[maxQuantityKey]
          : (voucher.maxQuantity ?? voucher.max_quantity);
        let maxQuantity = 0;
        if (maxQuantityRaw !== null && maxQuantityRaw !== undefined) {
          if (typeof maxQuantityRaw === 'string') {
            maxQuantity = parseInt(maxQuantityRaw, 10);
            if (isNaN(maxQuantity)) maxQuantity = 0;
          } else {
            maxQuantity = Number(maxQuantityRaw);
            if (isNaN(maxQuantity)) maxQuantity = 0;
          }
        }

        // Find userRedeemedLimit using same logic
        const userRedeemedLimitKey = allKeys.find(
          (key) =>
            key === 'userRedeemedLimit' ||
            key === 'user_redeemed_limit' ||
            key.toLowerCase() === 'userredeemedlimit' ||
            key.toLowerCase() === 'user_redeemed_limit',
        );
        const userRedeemedLimitRaw = userRedeemedLimitKey
          ? voucher[userRedeemedLimitKey]
          : (voucher.userRedeemedLimit ?? voucher.user_redeemed_limit);
        const userRedeemedLimit =
          userRedeemedLimitRaw !== null && userRedeemedLimitRaw !== undefined
            ? typeof userRedeemedLimitRaw === 'string'
              ? parseInt(userRedeemedLimitRaw, 10) || 0
              : Number(userRedeemedLimitRaw) || 0
            : 0;

        // Find pricePoint using same logic
        const pricePointKey = allKeys.find(
          (key) =>
            key === 'pricePoint' ||
            key === 'price_point' ||
            key.toLowerCase() === 'pricepoint' ||
            key.toLowerCase() === 'price_point',
        );
        const pricePointRaw = pricePointKey
          ? voucher[pricePointKey]
          : (voucher.pricePoint ?? voucher.price_point);
        const pricePoint =
          pricePointRaw !== null && pricePointRaw !== undefined
            ? typeof pricePointRaw === 'string'
              ? parseInt(pricePointRaw, 10) || 0
              : Number(pricePointRaw) || 0
            : 0;

        // Find startDate using same logic
        const startDateKey = allKeys.find(
          (key) =>
            key === 'startDate' ||
            key === 'start_date' ||
            key.toLowerCase() === 'startdate' ||
            key.toLowerCase() === 'start_date',
        );
        const startDate = startDateKey
          ? voucher[startDateKey]
          : (voucher.startDate ?? voucher.start_date);

        // Find endDate using same logic
        const endDateKey = allKeys.find(
          (key) =>
            key === 'endDate' ||
            key === 'end_date' ||
            key.toLowerCase() === 'enddate' ||
            key.toLowerCase() === 'end_date',
        );
        const endDate = endDateKey
          ? voucher[endDateKey]
          : (voucher.endDate ?? voucher.end_date);

        const isExchanged =
          userId &&
          userRedeemedLimit > 0 &&
          userRedeemedCount >= userRedeemedLimit;

        return {
          id: voucherId,
          title: voucher.title,
          description: voucher.description,
          voucherCode: voucher.voucherCode || voucher.voucher_code,
          voucherType: voucher.voucherType || voucher.voucher_type,
          pricePoint,
          startDate,
          endDate,
          maxQuantity,
          userRedeemedLimit,
          imageUrl: voucher.imageUrl || voucher.image_url,
          createdAt: voucher.createdAt || voucher.created_at,
          location: voucher.location_id
            ? {
                id: voucher.location_id,
                name: voucher.location_name,
              }
            : undefined,
          isExchanged: isExchanged || false,
        };
      });

      return {
        data: mappedData,
        meta: {
          itemsPerPage: limit,
          totalItems: filteredVouchers.length,
          currentPage: page,
          totalPages: Math.ceil(filteredVouchers.length / limit),
        },
        links: {
          first: `?page=1&limit=${limit}`,
          last: `?page=${Math.ceil(filteredVouchers.length / limit)}&limit=${limit}`,
          next:
            page < Math.ceil(filteredVouchers.length / limit)
              ? `?page=${page + 1}&limit=${limit}`
              : null,
          previous: page > 1 ? `?page=${page - 1}&limit=${limit}` : null,
        },
      } as Paginated<any>;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAllVouchersUnfiltered(
    query: PaginateQuery,
  ): Promise<Paginated<any>> {
    return paginate(
      query,
      this.locationVoucherRepository.repo,
      ILocationVoucherService_QueryConfig.getAllVouchersUnfiltered(),
    );
  }
}
