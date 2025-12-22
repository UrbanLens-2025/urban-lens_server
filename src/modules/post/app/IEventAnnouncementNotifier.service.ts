import { HandleEventAnnouncementDto } from '@/common/dto/posts/HandleEventAnnouncement.dto';

export const IEventAnnouncementNotifierService = Symbol(
  'IEventAnnouncementNotifierService',
);

export interface IEventAnnouncementNotifierService {
  handleEventAnnouncement(dto: HandleEventAnnouncementDto): Promise<void>;
}
