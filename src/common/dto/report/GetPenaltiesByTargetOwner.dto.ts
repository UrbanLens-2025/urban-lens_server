import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetPenaltiesByTargetOwnerDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  targetOwnerId: string;
}

