import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Location')
@Controller('/public/locations')
export class LocationPublicController {
  constructor() {}
}
