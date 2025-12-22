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
import { IScheduledJobService } from '@/modules/scheduled-jobs/app/IScheduledJob.service';
import { ScheduledJobType } from '@/common/constants/ScheduledJobType.constant';

@Injectable()
export class AnnouncementService
  extends CoreService
  implements IAnnouncementService
{
  constructor(
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
    @Inject(IScheduledJobService)
    private readonly scheduledJobService: IScheduledJobService,
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
        .then(async (res) => {
          // schedule a job to notify users of the announcement
          const job =
            await this.scheduledJobService.createLongRunningScheduledJob({
              associatedId: announcementEntity.id,
              jobType: ScheduledJobType.EVENT_ANNOUNCEMENT,
              payload: {
                announcementId: announcementEntity.id,
              },
              executeAt: announcementEntity.startDate,
              entityManager: em,
            });

          res.scheduledJobId = job.id;
          await announcementRepository.save(res);
          return res;
        })
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

      return repo
        .save(existing)
        .then(async (res) => {
          // if start date was changed, cancel the scheduled job and create a new one
          if (
            res.type === AnnouncementType.EVENT &&
            dto.startDate &&
            dto.startDate !== res.startDate
          ) {
            if (res.scheduledJobId) {
              await this.scheduledJobService.updateScheduledJobToCancelled({
                scheduledJobId: res.scheduledJobId,
                entityManager: em,
              });
            }

            const job =
              await this.scheduledJobService.createLongRunningScheduledJob({
                associatedId: res.id,
                jobType: ScheduledJobType.EVENT_ANNOUNCEMENT,
                payload: {
                  announcementId: res.id,
                },
                executeAt: res.startDate,
                entityManager: em,
              });
            res.scheduledJobId = job.id;
            await repo.save(res);
          }
          return res;
        })
        .then((e) => this.mapTo(AnnouncementResponseDto, e));
    });
  }
}
