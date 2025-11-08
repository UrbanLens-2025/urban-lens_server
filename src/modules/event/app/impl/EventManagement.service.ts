import { CoreService } from '@/common/core/Core.service';
import { UpdateEventDto } from '@/common/dto/event/UpdateEvent.dto';
import { IEventManagementService } from '@/modules/event/app/IEventManagement.service';
import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';
import { PublishEventDto } from '@/common/dto/event/PublishEvent.dto';
import { EventStatus } from '@/common/constants/EventStatus.constant';
import { FinishEventDto } from '@/common/dto/event/FinishEvent.dto';

@Injectable()
export class EventManagementService
  extends CoreService
  implements IEventManagementService
{
  constructor(
    @Inject(IFileStorageService)
    private readonly fileStorageService: IFileStorageService,
  ) {
    super();
  }
  updateMyEvent(dto: UpdateEventDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepository = EventRepository(em);

      await eventRepository.findOneByOrFail({
        id: dto.eventId,
        createdById: dto.accountId,
      });

      // Confirm uploads for image URLs
      await this.fileStorageService.confirmUpload(
        [dto.avatarUrl, dto.coverUrl],
        em,
      );

      const updatedEvent = this.mapTo_safe(EventEntity, dto);
      return eventRepository.update({ id: dto.eventId }, updatedEvent);
    });
  }

  publishEvent(dto: PublishEventDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (em) => {
      const eventRepository = EventRepository(em);

      const event = await eventRepository.findOneByOrFail({
        id: dto.eventId,
        createdById: dto.accountId,
      });

      if (event.status !== EventStatus.DRAFT) {
        throw new BadRequestException(
          `Event cannot be published. Current status: ${event.status}`,
        );
      }

      return eventRepository.update(
        { id: dto.eventId },
        { status: EventStatus.PUBLISHED },
      );
    });
  }
  
  finishEvent(dto: FinishEventDto): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }
}
