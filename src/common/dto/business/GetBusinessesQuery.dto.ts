import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { BusinessRequestStatus } from '@/common/constants/Business.constant';

export class GetBusinessesQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by business status',
    enum: BusinessRequestStatus,
    example: BusinessRequestStatus.APPROVED,
  })
  @IsOptional()
  @IsEnum(BusinessRequestStatus)
  status?: BusinessRequestStatus;

  @ApiPropertyOptional({
    description: 'Search by business name',
    example: 'Pizza Restaurant',
  })
  @IsOptional()
  search?: string;
}
