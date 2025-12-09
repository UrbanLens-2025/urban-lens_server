import { Exclude, Expose, Transform } from 'class-transformer';
import {
  parseSystemConfigValue,
  SystemConfigKey,
  SystemConfigValue,
} from '@/common/constants/SystemConfigKey.constant';

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
}
