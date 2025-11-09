import { CreateAnnouncementForLocationDto } from '@/common/dto/posts/CreateAnnouncementForLocation.dto';
import { UpdateAnnouncementDto } from '@/common/dto/posts/UpdateAnnouncement.dto';
import { AnnouncementResponseDto } from '@/common/dto/posts/Announcement.response.dto';
import { CreateAnnouncementForEventDto } from '@/common/dto/posts/CreateAnnouncementForEvent.dto';

export const IAnnouncementService = Symbol('IAnnouncementService');

export interface IAnnouncementService {
  createForLocation(
    dto: CreateAnnouncementForLocationDto,
  ): Promise<AnnouncementResponseDto>;

  createForEvent(
    dto: CreateAnnouncementForEventDto,
  ): Promise<AnnouncementResponseDto>;

  update(dto: UpdateAnnouncementDto): Promise<AnnouncementResponseDto>;
}
