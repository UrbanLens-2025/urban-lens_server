import { CoreService } from '@/common/core/Core.service';
import { UpdateEventDto } from '@/common/dto/event/UpdateEvent.dto';
import { IEventManagementService } from '@/modules/event/app/IEventManagement.service';
import { Inject, Injectable } from '@nestjs/common';
import { UpdateResult } from 'typeorm';
import { EventRepository } from '@/modules/event/infra/repository/Event.repository';
import { EventEntity } from '@/modules/event/domain/Event.entity';
import { IFileStorageService } from '@/modules/file-storage/app/IFileStorage.service';

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
}
