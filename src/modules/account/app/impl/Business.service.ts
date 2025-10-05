import { IBusinessService } from '../IBusiness.service';
import { CreateBusinessDto } from '@/common/dto/business/CreateBusiness.dto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BusinessRepository } from '../../infra/repository/Business.repository';
import { PaginationResult } from '@/common/services/base.service';
import { GetBusinessesQueryDto } from '@/common/dto/business/GetBusinessesQuery.dto';
import { UpdateBusinessStatusDto } from '@/common/dto/business/UpdateBusinessStatus.dto';
import { FindOptionsWhere, ILike } from 'typeorm';
import { BusinessEntity } from '@/modules/account/domain/Business.entity';
import { BusinessRequestStatus } from '@/common/constants/Business.constant';

@Injectable()
export class BusinessService implements IBusinessService {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async createBusiness(createBusinessDto: CreateBusinessDto): Promise<any> {
    const business = this.businessRepository.repo.create(createBusinessDto);
    return await this.businessRepository.repo.save(business);
  }

  async getBusinessById(businessId: string): Promise<any> {
    return await this.businessRepository.repo.findOne({
      where: { accountId: businessId },
      relations: ['account'],
    });
  }

  async getBusinessesWithPagination(
    queryParams: GetBusinessesQueryDto,
  ): Promise<PaginationResult<any>> {
    const { page = 1, limit = 10, status, search } = queryParams;
    const skip = (page - 1) * limit;

    // Build where clause with filters
    const where: FindOptionsWhere<BusinessEntity> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const [businesses, total] = await this.businessRepository.repo.findAndCount(
      {
        where,
        skip,
        take: limit,
        relations: ['account'],
        order: {
          createdAt: 'DESC',
        },
      },
    );

    return {
      data: businesses,
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async updateBusinessStatus(
    businessId: string,
    updateStatusDto: UpdateBusinessStatusDto,
    adminId: string,
  ): Promise<BusinessEntity> {
    // Find business by ID
    const business = await this.businessRepository.repo.findOne({
      where: { accountId: businessId },
      relations: ['account'],
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    // Validate admin notes for rejection
    if (updateStatusDto.status === BusinessRequestStatus.REJECTED) {
      if (
        !updateStatusDto.adminNotes ||
        updateStatusDto.adminNotes.trim() === ''
      ) {
        throw new BadRequestException(
          'Admin notes are required when rejecting a business',
        );
      }
    }

    // Update business status and admin info
    business.status = updateStatusDto.status;
    business.adminNotes =
      updateStatusDto.adminNotes || updateStatusDto.adminNotesOptional || null;
    business.reviewedBy = adminId;
    business.reviewedAt = new Date();

    // Save updated business
    return await this.businessRepository.repo.save(business);
  }
}
