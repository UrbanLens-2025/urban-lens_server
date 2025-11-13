import { CreatePublicLocationDto } from '@/common/dto/business/CreatePublicLocation.dto';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBatchPublicLocationDto {
  @ApiProperty({
    type: [CreatePublicLocationDto],
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreatePublicLocationDto)
  items: CreatePublicLocationDto[];
}
