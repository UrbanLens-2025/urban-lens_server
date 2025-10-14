import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { FollowEntityType } from '@/modules/account/domain/Follow.entity';

export class FollowDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The ID of the entity to follow (user or location)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  entityId: string;

  @IsEnum(FollowEntityType)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The type of entity to follow',
    example: FollowEntityType.USER,
    enum: FollowEntityType,
  })
  entityType: FollowEntityType;
}
