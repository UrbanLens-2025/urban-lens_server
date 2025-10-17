import { ReportEntityType } from '@/modules/report/domain/Report.entity';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetEntityReportsDto {
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
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  entityId: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    type: Number,
  })
  page?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    type: Number,
  })
  limit?: number;
}
