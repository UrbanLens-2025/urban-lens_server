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

export class CreatePenalty_SuspendLocationDto extends CoreActionDto {
  @Exclude()
  createdById: string;

  @ApiProperty({})
  @IsUUID()
  @IsNotEmpty()
  targetEntityId: string;

  @ApiProperty({
    enum: ReportEntityType,
    example: ReportEntityType.LOCATION,
  })
  @IsEnum(ReportEntityType)
  @IsNotEmpty()
  targetEntityType: ReportEntityType;

  @ApiProperty({})
  @IsString()
  @MaxLength(555)
  @IsNotEmpty()
  suspensionReason: string;

  @ApiProperty()
  @IsDate()
  @IsAfterToday()
  @IsNotEmpty()
  @Type(() => Date)
  suspendedUntil: Date;
}
