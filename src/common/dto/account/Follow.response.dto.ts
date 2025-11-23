import { Exclude, Expose, Type } from 'class-transformer';
import { AccountResponseDto } from './res/AccountResponse.dto';
import { FollowEntityType } from '@/modules/account/domain/Follow.entity';

@Exclude()
export class FollowResponseDto {
  @Expose()
  followId: string;

  @Expose()
  followerId: string;

  @Expose()
  entityId: string;

  @Expose()
  entityType: FollowEntityType;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => AccountResponseDto)
  entity?: AccountResponseDto;
}
