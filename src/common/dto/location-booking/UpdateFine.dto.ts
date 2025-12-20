import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateFineDto extends CoreActionDto {
  @Exclude()
  fineId: string;

  @Exclude()
  updateById: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fineReason?: string;
}
