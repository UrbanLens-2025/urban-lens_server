import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class CreateDefaultLocationBookingConfigDto extends CoreActionDto {
  locationId: string;
  businessId: string;
}

