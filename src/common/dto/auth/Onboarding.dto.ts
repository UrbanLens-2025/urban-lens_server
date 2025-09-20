import { IsNotEmpty, IsOptional, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export namespace OnboardUser {
  export class DTO {
    @IsOptional()
    @IsNotEmpty()
    @IsUrl()
    @MaxLength(1000)
    @ApiProperty({ default: 'https://picsum.photos/id/64/800/800' })
    avatarUrl?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsUrl()
    @MaxLength(1000)
    @ApiProperty({ default: 'https://picsum.photos/id/80/1920/1080' })
    coverUrl?: string;
  }
}