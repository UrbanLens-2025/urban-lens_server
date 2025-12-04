import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class BanPostBodyDto {
  @ApiPropertyOptional({
    description: 'Reason for banning the post',
    example: 'Violates community guidelines',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
