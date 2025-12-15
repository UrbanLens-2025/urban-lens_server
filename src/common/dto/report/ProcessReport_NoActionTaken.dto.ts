import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class ProcessReport_NoActionTakenDto extends CoreActionDto {
  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  @IsUUID(undefined, { each: true })
  reportIds: string[];

  @ApiProperty()
  @IsString()
  @MaxLength(555)
  @IsNotEmpty()
  reason: string;

  @Exclude()
  createdById: string;
}
