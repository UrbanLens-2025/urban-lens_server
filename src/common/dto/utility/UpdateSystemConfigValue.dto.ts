import { SystemConfigKey } from '@/common/constants/SystemConfigKey.constant';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Exclude, Transform } from 'class-transformer';
import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class UpdateSystemConfigValueDto<T extends SystemConfigKey> extends CoreActionDto {
  key: T;

  @Exclude()
  accountId: string;

  @ApiProperty({
    description: 'The value of the system config to update',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => String(value))
  value: string;
}
