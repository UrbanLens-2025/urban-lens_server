export const IUserProfileService = Symbol('IProfileService');

export interface IUserProfileService {
  createProfile(accountId: string): Promise<any>;
  getProfileByAccountId(accountId: string): Promise<any>;
  updateProfile(accountId: string, updateData: any): Promise<any>;
  deleteProfile(accountId: string): Promise<any>;
}
