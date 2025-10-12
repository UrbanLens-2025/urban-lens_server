import { IBusinessService } from '../IBusiness.service';
import { CreateBusinessDto } from '@/common/dto/business/CreateBusiness.dto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { BusinessRepository } from '../../infra/repository/Business.repository';
import { PaginationResult } from '@/common/services/base.service';
import { GetBusinessesQueryDto } from '@/common/dto/business/GetBusinessesQuery.dto';
import { UpdateBusinessStatusDto } from '@/common/dto/business/UpdateBusinessStatus.dto';
import { UpdateBusinessDto } from '@/common/dto/business/UpdateBusiness.dto';
import { FindOptionsWhere, ILike } from 'typeorm';
import { BusinessEntity } from '@/modules/account/domain/Business.entity';
import { BusinessRequestStatus } from '@/common/constants/Business.constant';
import { AccountRepository } from '@/modules/auth/infra/repository/Account.repository';
import { Role } from '@/common/constants/Role.constant';
import { IEmailNotificationService } from '@/modules/notification/app/IEmailNotification.service';
import { EmailTemplates } from '@/common/constants/EmailTemplates.constant';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';

@Injectable()
export class BusinessService implements IBusinessService {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly accountRepository: AccountRepository,
    @Inject(IEmailNotificationService)
    private readonly emailNotificationService: IEmailNotificationService,
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {}

  async createBusiness(
    accountId: string,
    createBusinessDto: CreateBusinessDto,
  ): Promise<any> {
    const existingBusiness = await this.businessRepository.repo.findOne({
      where: { accountId },
    });

    if (existingBusiness) {
      throw new BadRequestException(
        'Business already registered for this account',
      );
    }

    // Verify account exists and is business owner
    const account = await this.accountRepository.repo.findOne({
      where: { id: accountId, role: Role.BUSINESS_OWNER },
    });

    if (!account) {
      throw new NotFoundException('Business owner account not found');
    }

    return await this.businessRepository.repo.manager.transaction(
      async (transactionalEntityManager) => {
        // Confirm upload for avatar if provided
        if (createBusinessDto.avatar) {
          await this.fileStorageService.confirmUpload(
            [createBusinessDto.avatar],
            transactionalEntityManager,
          );
        }

        const business = this.businessRepository.repo.create({
          ...createBusinessDto,
          accountId,
          status: BusinessRequestStatus.PENDING,
        });

        return await transactionalEntityManager.save(business);
      },
    );
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

    // Save updated business
    const updatedBusiness = await this.businessRepository.repo.save(business);

    // Update account hasOnboarded status and send notification email
    if (updateStatusDto.status === BusinessRequestStatus.APPROVED) {
      await this.accountRepository.repo.update(business.accountId, {
        hasOnboarded: true,
        role: Role.BUSINESS_OWNER,
      });

      // Send approval email
      await this.emailNotificationService.sendEmail({
        to: business.account.email,
        template: EmailTemplates.BUSINESS_APPROVED,
        context: {
          businessOwnerName: `${business.account.firstName} ${business.account.lastName}`,
          businessName: business.name,
          businessCategory: business.category,
          approvedDate: new Date().toLocaleDateString(),
          adminNotes: business.adminNotes,
        },
      });
    } else if (updateStatusDto.status === BusinessRequestStatus.REJECTED) {
      // Send rejection email with feedback
      await this.emailNotificationService.sendEmail({
        to: business.account.email,
        template: EmailTemplates.BUSINESS_REJECTED,
        context: {
          businessOwnerName: `${business.account.firstName} ${business.account.lastName}`,
          businessName: business.name,
          businessCategory: business.category,
          reviewedDate: new Date().toLocaleDateString(),
          adminNotes: business.adminNotes,
        },
      });
    }
    // Note: If rejected, hasOnboarded remains false so user can update business info

    return updatedBusiness;
  }

  async updateBusiness(
    businessId: string,
    updateBusinessDto: UpdateBusinessDto,
    accountId: string,
  ): Promise<BusinessEntity> {
    // Find business by account ID to ensure owner can only update their own business
    const business = await this.businessRepository.repo.findOne({
      where: { accountId },
      relations: ['account'],
    });

    if (!business) {
      throw new NotFoundException(
        'Business not found or you do not have permission to update it',
      );
    }

    // Only allow updates if business is PENDING or REJECTED
    if (business.status === BusinessRequestStatus.APPROVED) {
      throw new BadRequestException(
        'Cannot update an approved business. Please contact admin for changes.',
      );
    }

    return await this.businessRepository.repo.manager.transaction(
      async (transactionalEntityManager) => {
        // Confirm upload for avatar if provided and different from current
        if (
          updateBusinessDto.avatar &&
          updateBusinessDto.avatar !== business.avatar
        ) {
          await this.fileStorageService.confirmUpload(
            [updateBusinessDto.avatar],
            transactionalEntityManager,
          );
        }

        // Update business fields
        Object.assign(business, updateBusinessDto);

        // Reset status to PENDING when business owner updates after rejection
        if (business.status === BusinessRequestStatus.REJECTED) {
          business.status = BusinessRequestStatus.PENDING;
          business.adminNotes = null; // Clear previous admin notes
        }

        return await transactionalEntityManager.save(business);
      },
    );
  }
}
