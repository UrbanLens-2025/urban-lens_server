import { IsAfterToday } from '@/common/decorators/IsAfterToday.decorator';
import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { ReportEntityType } from '@/modules/report/domain/Report.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreatePenalty_SuspendEventCreationAbilityDto extends CoreActionDto {
  @ApiProperty({})
  @IsDate()
  @IsAfterToday()
  @Type(() => Date)
  suspendUntil: Date;

  @ApiProperty({})
  @IsString()
  @MaxLength(555)
  suspensionReason: string;

  @ApiProperty({})
  @IsUUID()
  @IsNotEmpty()
  targetEntityId: string;

  @ApiProperty({
    enum: ReportEntityType,
    example: ReportEntityType.POST,
  })
  @IsEnum(ReportEntityType)
  @IsNotEmpty()
  targetEntityType: ReportEntityType;

  @Exclude()
  createdById: string;
}
