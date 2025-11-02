import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsUrl } from 'class-validator';

export class SocialLink {
  @Expose()
  @ApiProperty({ example: 'Facebook' })
  @IsNotEmpty()
  platform: string;

  @Expose()
  @ApiProperty({ example: 'http://facebook.com/profile' })
  @IsUrl()
  url: string;

  @Expose()
  @ApiProperty()
  @IsBoolean()
  isMain: boolean;
}
