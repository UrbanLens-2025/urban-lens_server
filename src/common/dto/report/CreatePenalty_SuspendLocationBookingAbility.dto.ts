import { IsAfterToday } from '@/common/decorators/IsAfterToday.decorator';
import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { ReportEntityType } from '@/modules/report/domain/Report.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import {
  IsEnum,
  IsUUID,
  IsNotEmpty,
  MaxLength,
  IsString,
  IsDate,
} from 'class-validator';

export class CreatePenalty_SuspendLocationBookingAbilityDto extends CoreActionDto {
  @ApiProperty({})
  @IsUUID()
  @IsNotEmpty()
  targetEntityId: string;

  @ApiProperty({})
  @IsEnum(ReportEntityType)
  @IsNotEmpty()
  targetEntityType: ReportEntityType;

  @ApiProperty({})
  @IsString()
  @MaxLength(555)
  suspensionReason: string;

  @ApiProperty({})
  @IsDate()
  @IsAfterToday()
  @Type(() => Date)
  suspendedUntil: Date;

  @Exclude()
  createdById: string;
}
