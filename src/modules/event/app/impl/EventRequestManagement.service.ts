import { CoreService } from '@/common/core/Core.service';
import { CreateEventRequestWithBusinessLocationDto } from '@/common/dto/event/CreateEventRequestWithBusinessLocation.dto';
import { IEventRequestManagementService } from '@/modules/event/app/IEventRequestManagement.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EventRequestRepository } from '@/modules/event/infra/repository/EventRequest.repository';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';
import { EventRequestEntity } from '@/modules/event/domain/EventRequest.entity';
import { EventRequestStatus } from '@/common/constants/EventRequestStatus.constant';
import { EventRequestResponseDto } from '@/common/dto/event/res/EventRequest.response.dto';
import { TagRepositoryProvider } from '@/modules/utility/infra/repository/Tag.repository';
import { EventRequestTagsRepository } from '@/modules/event/infra/repository/EventRequestTags.repository';

@Injectable()
export class EventRequestManagementService
  extends CoreService
  implements IEventRequestManagementService
{
  constructor(private readonly configService: ConfigService<Environment>) {
    super();
  }

  createEventRequest_WithBusinessLocation(
    dto: CreateEventRequestWithBusinessLocationDto,
  ): Promise<EventRequestResponseDto> {
    return this.ensureTransaction(null, async (em) => {
      const eventRequestRepository = EventRequestRepository(em);
      const tagRepository = TagRepositoryProvider(em);
      const eventRequestTagRepository = EventRequestTagsRepository(em);

      // validate tags
      const tags = await tagRepository.countSelectableTagsById(dto.tagIds);
      if (tags !== dto.tagIds.length) {
        throw new BadRequestException(
          'One or more tags are invalid. Please check tag visibility.',
        );
      }

      const eventRequest = this.mapTo_safe(EventRequestEntity, dto);
      eventRequest.createdById = dto.accountId;
      eventRequest.status = EventRequestStatus.PENDING;

      return (
        eventRequestRepository
          .save(eventRequest)
          // save tags
          .then(async (savedEventRequest) => {
            savedEventRequest.eventRequestTags =
              await eventRequestTagRepository.persistEntities({
                eventRequestId: savedEventRequest.id,
                tagIds: dto.tagIds,
              });
            return savedEventRequest;
          })
          // map to response
          .then((res) => this.mapTo(EventRequestResponseDto, res))
      );
    });
  }
}
