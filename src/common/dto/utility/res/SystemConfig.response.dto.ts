import { Exclude, Expose, Transform, Type } from 'class-transformer';
import {
  parseSystemConfigValue,
  SystemConfigKey,
  SystemConfigValue,
} from '@/common/constants/SystemConfigKey.constant';
import { AccountResponseDto } from '@/common/dto/account/res/AccountResponse.dto';

@Exclude()
export class SystemConfigResponseDto<T extends SystemConfigKey> {
  @Expose()
  id: string;

  @Expose()
  key: T;

  @Expose()
  @Transform(({ value, obj }) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    parseSystemConfigValue(obj['key'] as T, value as string),
  )
  value: SystemConfigValue[T];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  updatedById?: string | null;

  @Expose()
  @Type(() => AccountResponseDto)
  updatedBy?: AccountResponseDto | null;
}
