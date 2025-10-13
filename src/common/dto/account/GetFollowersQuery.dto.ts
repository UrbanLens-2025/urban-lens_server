import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { FollowEntityType } from '@/modules/account/domain/Follow.entity';

export class GetFollowersQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
  })
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  limit?: number = 10;

  @IsOptional()
  @IsEnum(FollowEntityType)
  @ApiProperty({
    description: 'Filter by entity type',
    example: FollowEntityType.USER,
    enum: FollowEntityType,
    required: false,
  })
  entityType?: FollowEntityType;
}
