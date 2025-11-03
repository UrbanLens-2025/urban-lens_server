import { Injectable } from '@nestjs/common';
import { CoreService } from '@/common/core/Core.service';
import {
  IAnnouncementQueryService,
  IAnnouncementQueryService_QueryConfig,
} from '@/modules/post/app/IAnnouncementQuery.service';
import { SearchAnnouncementsByLocationDto } from '@/common/dto/posts/SearchAnnouncementsByLocation.dto';
import { paginate, Paginated } from 'nestjs-paginate';
import { AnnouncementResponseDto } from '@/common/dto/posts/Announcement.response.dto';
import { AnnouncementRepository } from '@/modules/post/infra/repository/Announcement.repository';
import { SearchVisibleAnnouncementsDto } from '@/common/dto/posts/SearchVisibleAnnouncements.dto';
import { SearchMyAnnouncementsDto } from '@/common/dto/posts/SearchMyAnnouncements.dto';
import { IsNull, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { GetAnnouncementByIdDto } from '@/common/dto/posts/GetAnnouncementById.dto';
import { GetMyAnnouncementByIdDto } from '@/common/dto/posts/GetMyAnnouncementById.dto';

@Injectable()
export class AnnouncementQueryService
  extends CoreService
  implements IAnnouncementQueryService
{
  async searchByLocation(
    dto: SearchAnnouncementsByLocationDto,
  ): Promise<Paginated<AnnouncementResponseDto>> {
    return paginate(dto.query, AnnouncementRepository(this.dataSource), {
      ...IAnnouncementQueryService_QueryConfig.searchByLocation(),
      where: { locationId: dto.locationId },
    }).then((res) => this.mapToPaginated(AnnouncementResponseDto, res));
  }

  async getAllVisibleAnnouncements(
    dto: SearchVisibleAnnouncementsDto,
  ): Promise<Paginated<AnnouncementResponseDto>> {
    const now = new Date();
    return paginate(dto.query, AnnouncementRepository(this.dataSource), {
      ...IAnnouncementQueryService_QueryConfig.searchByLocation(),
      where: [
        {
          locationId: dto.locationId,
          isHidden: false,
          startDate: LessThanOrEqual(now),
          endDate: IsNull(),
        },
        {
          locationId: dto.locationId,
          isHidden: false,
          startDate: LessThanOrEqual(now),
          endDate: MoreThanOrEqual(now),
        },
      ],
    }).then((res) => this.mapToPaginated(AnnouncementResponseDto, res));
  }

  async getAllAnnouncements(
    dto: SearchMyAnnouncementsDto,
  ): Promise<Paginated<AnnouncementResponseDto>> {
    return paginate(dto.query, AnnouncementRepository(this.dataSource), {
      ...IAnnouncementQueryService_QueryConfig.searchByLocation(),
      where: {
        createdById: dto.accountId,
        locationId: dto.locationId,
      },
    }).then((res) => this.mapToPaginated(AnnouncementResponseDto, res));
  }

  async getPublicById(
    dto: GetAnnouncementByIdDto,
  ): Promise<AnnouncementResponseDto> {
    const now = new Date();
    const repo = AnnouncementRepository(this.dataSource);
    const found = await repo.findOneOrFail({
      where: [
        {
          id: dto.id,
          isHidden: false,
          startDate: LessThanOrEqual(now),
          endDate: IsNull(),
        },
        {
          id: dto.id,
          isHidden: false,
          startDate: LessThanOrEqual(now),
          endDate: MoreThanOrEqual(now),
        },
      ],
    });
    return this.mapTo(AnnouncementResponseDto, found);
  }

  async getOwnerById(
    dto: GetMyAnnouncementByIdDto,
  ): Promise<AnnouncementResponseDto> {
    const repo = AnnouncementRepository(this.dataSource);
    const found = await repo.findOneOrFail({
      where: { id: dto.id, createdById: dto.accountId },
    });
    return this.mapTo(AnnouncementResponseDto, found);
  }
}
