import { Exclude, Expose, Transform, Type } from 'class-transformer';

class UserBasicInfoDto {
  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  avatarUrl: string | null;
}

@Exclude()
export class VoucherUserResponseDto {
  @Expose()
  id: string;

  @Expose()
  voucherId: string;

  @Expose()
  userProfileId: string;

  @Expose()
  pointSpent: number;

  @Expose()
  userVoucherCode: string;

  @Expose()
  @Type(() => Date)
  usedAt: Date | null;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Transform(({ obj }) => {
    // Map userProfile.account to user with only basic info
    const account = obj.userProfile?.account;
    if (!account) {
      return null;
    }
    return {
      firstName: account.firstName,
      lastName: account.lastName,
      avatarUrl: account.avatarUrl,
    };
  })
  @Type(() => UserBasicInfoDto)
  user?: UserBasicInfoDto;
}
