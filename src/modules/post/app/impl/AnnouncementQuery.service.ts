import { Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import {
  IAnnouncementQueryService,
  IAnnouncementQueryService_QueryConfig,
} from '@/modules/post/app/IAnnouncementQuery.service';
import { AnnouncementResponseDto } from '@/common/dto/posts/Announcement.response.dto';
import { GetMyAnnouncementByIdDto } from '@/common/dto/posts/GetMyAnnouncementById.dto';
import { GetMyEventsAnnouncementsDto } from '@/common/dto/posts/GetMyEventsAnnouncements.dto';
import { GetMyLocationsAnnouncementsDto } from '@/common/dto/posts/GetMyLocationsAnnouncements.dto';
import { GetViewableAnnouncementByIdDto } from '@/common/dto/posts/GetViewableAnnouncementById.dto';
import { GetViewableAnnouncementsForEventDto } from '@/common/dto/posts/GetViewableAnnouncementsForEvent.dto';
import { GetViewableAnnouncementsForLocationDto } from '@/common/dto/posts/GetViewableAnnouncementsForLocation.dto';
import { paginate, Paginated } from 'nestjs-paginate';
import { AnnouncementRepository } from '@/modules/post/infra/repository/Announcement.repository';
import { AnnouncementType } from '@/common/constants/AnnouncementType.constant';

@Injectable()
export class AnnouncementQueryService
  extends CoreService
  implements IAnnouncementQueryService
{
  getViewableAnnouncementsForLocation(
    dto: GetViewableAnnouncementsForLocationDto,
  ): Promise<Paginated<AnnouncementResponseDto>> {
    const announcementRepository = AnnouncementRepository(this.dataSource);
    return paginate(dto.query, announcementRepository, {
      ...IAnnouncementQueryService_QueryConfig.getViewableAnnouncementsForLocation(),
      where: {
        locationId: dto.locationId,
        type: AnnouncementType.LOCATION,
        isHidden: false,
      },
    }).then((res) => this.mapToPaginated(AnnouncementResponseDto, res));
  }

  getViewableAnnouncementsForEvent(
    dto: GetViewableAnnouncementsForEventDto,
  ): Promise<Paginated<AnnouncementResponseDto>> {
    const announcementRepository = AnnouncementRepository(this.dataSource);
    return paginate(dto.query, announcementRepository, {
      ...IAnnouncementQueryService_QueryConfig.getViewableAnnouncementsForEvent(),
      where: {
        eventId: dto.eventId,
        type: AnnouncementType.EVENT,
        isHidden: false,
      },
    }).then((res) => this.mapToPaginated(AnnouncementResponseDto, res));
  }

  getViewableAnnouncementById(
    dto: GetViewableAnnouncementByIdDto,
  ): Promise<AnnouncementResponseDto> {
    const announcementRepository = AnnouncementRepository(this.dataSource);
    return announcementRepository
      .findOneByOrFail({
        id: dto.announcementId,
        isHidden: false,
      })
      .then((res) => this.mapTo(AnnouncementResponseDto, res));
  }

  getMyLocationsAnnouncements(
    dto: GetMyLocationsAnnouncementsDto,
  ): Promise<Paginated<AnnouncementResponseDto>> {
    const announcementRepository = AnnouncementRepository(this.dataSource);
    return paginate(dto.query, announcementRepository, {
      ...IAnnouncementQueryService_QueryConfig.getMyLocationsAnnouncements(),
      where: {
        locationId: dto.locationId,
        type: AnnouncementType.LOCATION,
        location: {
          businessId: dto.accountId,
        },
      },
    }).then((res) => this.mapToPaginated(AnnouncementResponseDto, res));
  }

  getMyEventsAnnouncements(
    dto: GetMyEventsAnnouncementsDto,
  ): Promise<Paginated<AnnouncementResponseDto>> {
    const announcementRepository = AnnouncementRepository(this.dataSource);
    return paginate(dto.query, announcementRepository, {
      ...IAnnouncementQueryService_QueryConfig.getMyEventsAnnouncements(),
      where: {
        eventId: dto.eventId,
        type: AnnouncementType.EVENT,
        event: {
          createdById: dto.accountId,
        },
      },
    }).then((res) => this.mapToPaginated(AnnouncementResponseDto, res));
  }

  getMyAnnouncementById(
    dto: GetMyAnnouncementByIdDto,
  ): Promise<AnnouncementResponseDto> {
    const announcementRepository = AnnouncementRepository(this.dataSource);
    return announcementRepository
      .findOneByOrFail({
        id: dto.announcementId,
        createdById: dto.accountId, // TODO: Check this part if errors
      })
      .then((res) => this.mapTo(AnnouncementResponseDto, res));
  }
}
