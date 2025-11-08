import { Inject, Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import { IAnnouncementService } from '@/modules/post/app/IAnnouncement.service';
import { CreateAnnouncementForLocationDto } from '@/common/dto/posts/CreateAnnouncementForLocation.dto';
import { UpdateAnnouncementDto } from '@/common/dto/posts/UpdateAnnouncement.dto';
import { AnnouncementResponseDto } from '@/common/dto/posts/Announcement.response.dto';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { AnnouncementRepository } from '@/modules/post/infra/repository/Announcement.repository';
import { AnnouncementEntity } from '@/modules/post/domain/Announcement.entity';
import { LocationRepositoryProvider } from '@/modules/business/infra/repository/Location.repository';
import { CreateAnnouncementForEventDto } from '@/common/dto/posts/CreateAnnouncementForEvent.dto';

@Injectable()
export class AnnouncementService
  extends CoreService
  implements IAnnouncementService
{
  constructor(
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {
    super();
  }
  createForEvent(
    dto: CreateAnnouncementForEventDto,
  ): Promise<AnnouncementResponseDto> {
    throw new Error('Method not implemented.');
  }

  async createForLocation(
    dto: CreateAnnouncementForLocationDto,
  ): Promise<AnnouncementResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const repo = AnnouncementRepository(em);

      if (dto.imageUrl) {
        await this.fileStorageService.confirmUpload([dto.imageUrl], em);
      }

      const entity = new AnnouncementEntity();

      // Ownership check if locationId provided
      if (dto.locationId) {
        const locationRepo = LocationRepositoryProvider(em);
        const location = await locationRepo.findOneByOrFail({
          id: dto.locationId,
          businessId: dto.accountId,
        });
        entity.locationId = location.id;
      }

      this.assignTo_safe(entity, dto);
      entity.createdById = dto.accountId;
      entity.updatedById = dto.accountId;

      const saved = await repo.save(entity);
      return this.mapTo(AnnouncementResponseDto, saved);
    });
  }

  async update(dto: UpdateAnnouncementDto): Promise<AnnouncementResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const repo = AnnouncementRepository(em);
      const existing = await repo.findOneByOrFail({
        id: dto.id,
        createdById: dto.accountId,
      });

      if (dto.imageUrl)
        await this.fileStorageService.confirmUpload([dto.imageUrl], em);

      this.assignTo_safeIgnoreEmpty(existing, dto);
      existing.updatedById = dto.accountId ?? existing.updatedById;

      const saved = await repo.save(existing);
      return this.mapTo(AnnouncementResponseDto, saved);
    });
  }
}
