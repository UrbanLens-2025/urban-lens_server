import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

export class MarkReportsFirstSeenDto extends CoreActionDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true })
  @IsUUID(undefined, { each: true })
  reportIds: string[];

  @Exclude()
  adminId: string;
}

