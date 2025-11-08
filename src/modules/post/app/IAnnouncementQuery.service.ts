import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { AnnouncementEntity } from '@/modules/post/domain/Announcement.entity';
import { AnnouncementResponseDto } from '@/common/dto/posts/Announcement.response.dto';
import { GetMyAnnouncementByIdDto } from '@/common/dto/posts/GetMyAnnouncementById.dto';
import { GetViewableAnnouncementsForLocationDto } from '@/common/dto/posts/GetViewableAnnouncementsForLocation.dto';
import { GetViewableAnnouncementsForEventDto } from '@/common/dto/posts/GetViewableAnnouncementsForEvent.dto';
import { GetViewableAnnouncementByIdDto } from '@/common/dto/posts/GetViewableAnnouncementById.dto';
import { GetMyLocationsAnnouncementsDto } from '@/common/dto/posts/GetMyLocationsAnnouncements.dto';
import { GetMyEventsAnnouncementsDto } from '@/common/dto/posts/GetMyEventsAnnouncements.dto';

export const IAnnouncementQueryService = Symbol('IAnnouncementQueryService');

export interface IAnnouncementQueryService {
  getViewableAnnouncementsForLocation(dto: GetViewableAnnouncementsForLocationDto): Promise<Paginated<AnnouncementResponseDto>>;
  getViewableAnnouncementsForEvent(dto: GetViewableAnnouncementsForEventDto): Promise<Paginated<AnnouncementResponseDto>>;
  getViewableAnnouncementById(dto: GetViewableAnnouncementByIdDto): Promise<AnnouncementResponseDto>;

  getMyLocationsAnnouncements(dto: GetMyLocationsAnnouncementsDto): Promise<Paginated<AnnouncementResponseDto>>;
  getMyEventsAnnouncements(dto: GetMyEventsAnnouncementsDto): Promise<Paginated<AnnouncementResponseDto>>;
  getMyAnnouncementById(dto: GetMyAnnouncementByIdDto): Promise<AnnouncementResponseDto>;
}

export namespace IAnnouncementQueryService_QueryConfig {
  export function getViewableAnnouncementsForLocation(): PaginateConfig<AnnouncementEntity> {
    return {
      sortableColumns: ['createdAt', 'startDate'],
      defaultSortBy: [['startDate', 'DESC']],
      searchableColumns: ['title', 'description'],
    };
  }

  export function getViewableAnnouncementsForEvent(): PaginateConfig<AnnouncementEntity> {
    return {
      sortableColumns: ['createdAt', 'startDate'],
      defaultSortBy: [['startDate', 'DESC']],
      searchableColumns: ['title', 'description'],
    };
  }

  export function getMyLocationsAnnouncements(): PaginateConfig<AnnouncementEntity> {
    return {
      sortableColumns: ['createdAt', 'startDate'],
      defaultSortBy: [['startDate', 'DESC']],
      searchableColumns: ['title', 'description'],
    };
  }

  export function getMyEventsAnnouncements(): PaginateConfig<AnnouncementEntity> {
    return {
      sortableColumns: ['createdAt', 'startDate'],
      defaultSortBy: [['startDate', 'DESC']],
      searchableColumns: ['title', 'description'],
    };
  }
}
