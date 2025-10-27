import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateLocationMissionDto } from './CreateLocationMission.dto';

export class UpdateLocationMissionDto extends PartialType(
  CreateLocationMissionDto,
) {
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Whether mission is active',
    example: true,
    required: false,
  })
  isActive?: boolean;
}
