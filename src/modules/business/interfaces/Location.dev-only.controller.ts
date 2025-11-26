import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('_Development')
@Controller('/dev-only/locations')
export class LocationDevOnlyController {
  // Analytics are now part of LocationEntity, no need for separate backfill
  // All locations have default analytics values (0) when created
}
