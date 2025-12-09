import { SystemConfigKey } from '@/common/constants/SystemConfigKey.constant';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateSystemConfigValueDto<T extends SystemConfigKey> {
  key: T;

  @ApiProperty({
    description: 'The value of the system config to update',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => String(value))
  value: string;
}
