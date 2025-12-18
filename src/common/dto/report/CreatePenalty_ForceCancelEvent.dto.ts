import { CoreActionDto } from '@/common/dto/CoreAction.dto';
import { ReportEntityType } from '@/modules/report/domain/Report.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePenalty_ForceCancelEventDto extends CoreActionDto {
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

  @ApiProperty({
    example: 'Event was cancelled by the admin.',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @Exclude()
  createdById: string;
}
