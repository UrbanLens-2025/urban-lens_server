import { ReportEntityType } from '@/modules/report/domain/Report.entity';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { type PaginateQuery } from 'nestjs-paginate';

export class GetReportsByTargetTypeDto {
  @IsEnum(ReportEntityType)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The type of the entity',
    example: ReportEntityType.POST,
    enum: ReportEntityType,
  })
  targetType: ReportEntityType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The id of the entity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  targetId: string;

  query: PaginateQuery;
}
