import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class HandleEventAnnouncementDto extends CoreActionDto {
  announcementId: string;
  scheduledJobId: number;
}
