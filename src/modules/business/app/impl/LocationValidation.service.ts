import { CoreService } from '@/common/core/Core.service';
import { ValidateLocationDto } from '@/common/dto/business/ValidateLocation.dto';
import { ILocationValidationService } from '@/modules/business/app/ILocationValidation.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LocationValidationService
  extends CoreService
  implements ILocationValidationService
{
  validateLocation(dto: ValidateLocationDto): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
