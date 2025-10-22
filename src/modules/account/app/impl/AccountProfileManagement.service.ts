import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IAccountProfileManagementService } from '@/modules/account/app/IAccountProfileManagement.service';
import { CreatorProfileRepository } from '@/modules/account/infra/repository/CreatorProfile.repository';
import { UpdateResult } from 'typeorm';
import { UpdateCreatorProfileDto } from '@/common/dto/account/UpdateCreatorProfile.dto';
import { UpdateBusinessDto } from '@/common/dto/business/UpdateBusiness.dto';
import { BusinessRepositoryProvider } from '@/modules/account/infra/repository/Business.repository';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { UpdateBusinessStatusDto } from '@/common/dto/business/UpdateBusinessStatus.dto';

@Injectable()
export class AccountProfileManagementService
  extends CoreService
  implements IAccountProfileManagementService
{
  constructor(
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {
    super();
  }

  updateCreatorProfile(dto: UpdateCreatorProfileDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (manager) => {
      const creatorProfileRepository = CreatorProfileRepository(manager);
      await creatorProfileRepository.findOneByOrFail({
        accountId: dto.accountId,
      });

      return await creatorProfileRepository.update(
        { accountId: dto.accountId },
        { ...dto },
      );
    });
  }

  updateBusinessBeforeApproval(
    updateBusinessDto: UpdateBusinessDto,
    accountId: string,
  ): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const businessProfileRepository = BusinessRepositoryProvider(em);
      const business = await businessProfileRepository.findOneOrFail({
        where: {
          accountId,
        },
      });

      if (!business.canBeUpdated()) {
        throw new BadRequestException('Business profile cannot be updated.');
      }

      await this.fileStorageService.confirmUpload(
        [updateBusinessDto.avatar],
        em,
      );

      Object.assign(business, updateBusinessDto);

      return businessProfileRepository.update(
        {
          accountId,
        },
        business,
      );
    });
  }

  async processBusinessRequest(
    businessId: string,
    updateStatusDto: UpdateBusinessStatusDto,
    accountId: string,
  ): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const businessProfileRepository = BusinessRepositoryProvider(em);

      const businessProfile = await businessProfileRepository.findOneOrFail({
        where: {
          accountId: businessId,
        },
        relations: {
          account: true,
        },
      });

      if (!businessProfile.canBeProcessed()) {
        throw new BadRequestException(
          'Business request has already been processed.',
        );
      }

      businessProfile.status = updateStatusDto.status;
      businessProfile.adminNotes = updateStatusDto.adminNotes ?? null;
      // TODO assign processedBy admin

      return await businessProfileRepository
        .update(
          {
            accountId: businessId,
          },
          businessProfile,
        )
        .then((res) => {
          // TODO fire events when business is accepted or rejected
          return res;
        });
    });
    // Update account hasOnboarded status and send notification email
    // if (updateStatusDto.status === BusinessRequestStatus.APPROVED) {
    //   // Send approval email
    //   await this.emailNotificationService.sendEmail({
    //     to: business.account.email,
    //     template: EmailTemplates.BUSINESS_APPROVED,
    //     context: {
    //       businessOwnerName: `${business.account.firstName} ${business.account.lastName}`,
    //       businessName: business.name,
    //       businessCategory: business.category,
    //       approvedDate: new Date().toLocaleDateString(),
    //       adminNotes: business.adminNotes,
    //     },
    //   });
    // } else if (updateStatusDto.status === BusinessRequestStatus.REJECTED) {
    //   // Send rejection email with feedback
    //   await this.emailNotificationService.sendEmail({
    //     to: business.account.email,
    //     template: EmailTemplates.BUSINESS_REJECTED,
    //     context: {
    //       businessOwnerName: `${business.account.firstName} ${business.account.lastName}`,
    //       businessName: business.name,
    //       businessCategory: business.category,
    //       reviewedDate: new Date().toLocaleDateString(),
    //       adminNotes: business.adminNotes,
    //     },
    //   });
    // }
  }
}
