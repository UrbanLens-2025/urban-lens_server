import { PaginateConfig, Paginated } from 'nestjs-paginate';
import { AnnouncementResponseDto } from '@/common/dto/posts/Announcement.response.dto';
import { AnnouncementEntity } from '@/modules/post/domain/Announcement.entity';
import { SearchAnnouncementsByLocationDto } from '@/common/dto/posts/SearchAnnouncementsByLocation.dto';
import { SearchVisibleAnnouncementsDto } from '@/common/dto/posts/SearchVisibleAnnouncements.dto';
import { SearchMyAnnouncementsDto } from '@/common/dto/posts/SearchMyAnnouncements.dto';
import { GetAnnouncementByIdDto } from '@/common/dto/posts/GetAnnouncementById.dto';
import { GetMyAnnouncementByIdDto } from '@/common/dto/posts/GetMyAnnouncementById.dto';

export const IAnnouncementQueryService = Symbol('IAnnouncementQueryService');

export interface IAnnouncementQueryService {
  searchByLocation(
    dto: SearchAnnouncementsByLocationDto,
  ): Promise<Paginated<AnnouncementResponseDto>>;

  getAllVisibleAnnouncements(
    dto: SearchVisibleAnnouncementsDto,
  ): Promise<Paginated<AnnouncementResponseDto>>;

  getAllAnnouncements(
    dto: SearchMyAnnouncementsDto,
  ): Promise<Paginated<AnnouncementResponseDto>>;

  getPublicById(dto: GetAnnouncementByIdDto): Promise<AnnouncementResponseDto>;

  getOwnerById(dto: GetMyAnnouncementByIdDto): Promise<AnnouncementResponseDto>;
}

export namespace IAnnouncementQueryService_QueryConfig {
  export function searchByLocation(): PaginateConfig<AnnouncementEntity> {
    return {
      sortableColumns: ['createdAt', 'startDate'],
      defaultSortBy: [['startDate', 'DESC']],
      filterableColumns: {
        isHidden: true,
      },
      searchableColumns: ['title', 'description'],
    };
  }
}
