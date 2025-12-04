import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class BanPostDto {
  @ApiProperty({
    description: 'The ID of the post to ban',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  postId: string;

  @ApiPropertyOptional({
    description: 'Reason for banning the post',
    example: 'Violates community guidelines',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
