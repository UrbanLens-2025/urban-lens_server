import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { ReportEntityType } from '@/modules/report/domain/Report.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
    IsUUID,
    MaxLength,
    Min
} from 'class-validator';

export class CreatePenalty_FineLocationBookingDto extends CoreActionDto {
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

  @ApiProperty({
    description: 'The amount of the fine',
    example: 100000,
  })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  fineAmount: number;

  @ApiProperty({
    description: 'The reason for the fine',
    example: 'Late check-in',
  })
  @IsString()
  @MaxLength(555)
  @IsNotEmpty()
  fineReason: string;
}
