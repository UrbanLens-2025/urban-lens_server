import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class GetAllBookingsAtLocationByDateRangeDto extends CoreActionDto {
  locationId: string;
  startDate: Date;
  endDate: Date;
}
