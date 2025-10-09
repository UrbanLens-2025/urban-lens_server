import { PartialType } from '@nestjs/swagger';
import { CreateLocationDto } from './CreateLocation.dto';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
