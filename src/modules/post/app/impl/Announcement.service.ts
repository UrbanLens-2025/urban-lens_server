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
import { AnnouncementType } from '@/common/constants/AnnouncementType.constant';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';

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
    return this.ensureTransaction(null, async (em) => {
      const announcementRepository = AnnouncementRepository(em);
      const eventRepository = EventRepository(em);

      const event = await eventRepository.findOneByOrFail({
        id: dto.eventId,
        createdById: dto.accountId,
      });

      const announcementEntity = new AnnouncementEntity();
      this.assignTo_safe(announcementEntity, dto);
      announcementEntity.createdById = dto.accountId;
      announcementEntity.updatedById = dto.accountId;
      announcementEntity.type = AnnouncementType.EVENT;
      announcementEntity.event = event;

      await this.fileStorageService.confirmUpload([dto.imageUrl], em);

      return announcementRepository
        .save(announcementEntity)
        .then((e) => this.mapTo(AnnouncementResponseDto, e));
    });
  }

  async createForLocation(
    dto: CreateAnnouncementForLocationDto,
  ): Promise<AnnouncementResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const announcementRepository = AnnouncementRepository(em);
      const locationRepository = LocationRepositoryProvider(em);

      const location = await locationRepository.findOneByOrFail({
        id: dto.locationId,
        businessId: dto.accountId,
      });

      const announcementEntity = new AnnouncementEntity();

      this.assignTo_safe(announcementEntity, dto);
      announcementEntity.createdById = dto.accountId;
      announcementEntity.updatedById = dto.accountId;
      announcementEntity.type = AnnouncementType.LOCATION;
      announcementEntity.location = location;

      await this.fileStorageService.confirmUpload([dto.imageUrl], em);

      return announcementRepository
        .save(announcementEntity)
        .then((e) => this.mapTo(AnnouncementResponseDto, e));
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
