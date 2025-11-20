import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { LocationEntity } from '@/modules/business/domain/Location.entity';

export class CreateLocationEntityDto extends CoreActionDto {
  locationEntity: LocationEntity;
}
