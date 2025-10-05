export const IProfileService = Symbol('IProfileService');

export interface IProfileService {
  createProfile(accountId: string): Promise<any>;
  getProfileByAccountId(accountId: string): Promise<any>;
  updateProfile(accountId: string, updateData: any): Promise<any>;
  deleteProfile(accountId: string): Promise<any>;
}
