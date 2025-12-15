import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { ReportEntityType } from '@/modules/report/domain/Report.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreatePenalty_WarnUserDto extends CoreActionDto {
  @ApiProperty({
    description: `This should be the ID of the entity that the user is being warned for. 
      For example, if the user is being warned for a post, this should be the post ID. 
      If the user is being warned for an event, this should be the event ID. 
      If the user is being warned for a location, this should be the location ID.`,
  })
  @IsUUID()
  targetEntityId: string;

  @ApiProperty({
    enum: ReportEntityType,
    example: ReportEntityType.POST,
  })
  @IsEnum(ReportEntityType)
  targetEntityType: ReportEntityType;

  @ApiProperty()
  @IsString()
  @MaxLength(555)
  @IsNotEmpty()
  warningNote: string;

  @Exclude()
  createdById: string;
}
