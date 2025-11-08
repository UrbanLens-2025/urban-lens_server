import { UserProfileEntity } from '@/modules/account/domain/UserProfile.entity';

export interface IUserProfileRepository {
  /**
   * Find user profile with tag scores
   */
  findByAccountId(accountId: string): Promise<UserProfileEntity | null>;
}

export const IUserProfileRepository = Symbol('IUserProfileRepository');
