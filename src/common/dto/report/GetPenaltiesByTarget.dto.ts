import { ReportEntityType } from '@/modules/report/domain/Report.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class GetPenaltiesByTargetDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  targetId: string;

  @ApiProperty({
    enum: ReportEntityType,
    example: ReportEntityType.POST,
  })
  @IsEnum(ReportEntityType)
  @IsNotEmpty()
  targetType: ReportEntityType;
}

