import { PartialType } from '@nestjs/swagger';
import { CreateBusinessDto } from './CreateBusiness.dto';

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {}
