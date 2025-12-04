import { ValidateLocationDto } from '@/common/dto/business/ValidateLocation.dto';

export const ILocationValidationService = Symbol('ILocationValidationService');

export interface ILocationValidationService {
  validateLocation(dto: ValidateLocationDto): Promise<void>;
}
