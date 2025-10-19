import { ReportEntityType } from '@/modules/report/domain/Report.entity';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @IsEnum(ReportEntityType)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The type of the entity',
    example: ReportEntityType.POST,
    enum: ReportEntityType,
  })
  entityType: ReportEntityType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The id of the entity',
    example: '1',
  })
  entityId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The title of the report',
    example: 'This is a report',
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The reason of the report',
    example: 'This is a report',
  })
  reason: string;

  @IsString()
  @IsOptional()
  userId: string;
}
