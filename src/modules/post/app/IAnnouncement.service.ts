import { CreateAnnouncementDto } from '@/common/dto/posts/CreateAnnouncement.dto';
import { UpdateAnnouncementDto } from '@/common/dto/posts/UpdateAnnouncement.dto';
import { GetAnnouncementByIdDto } from '@/common/dto/posts/GetAnnouncementById.dto';
import { AnnouncementResponseDto } from '@/common/dto/posts/Announcement.response.dto';

export const IAnnouncementService = Symbol('IAnnouncementService');

export interface IAnnouncementService {
  create(dto: CreateAnnouncementDto): Promise<AnnouncementResponseDto>;
  update(dto: UpdateAnnouncementDto): Promise<AnnouncementResponseDto>;
}
