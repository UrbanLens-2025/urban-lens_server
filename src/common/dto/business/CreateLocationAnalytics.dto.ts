import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class CreateLocationAnalyticsDto extends CoreActionDto {
  locationId: string;
}
