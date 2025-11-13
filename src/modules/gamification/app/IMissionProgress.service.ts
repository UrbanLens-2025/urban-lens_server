export const IMissionProgressService = Symbol('IMissionProgressService');

export interface IMissionProgressService {
  /**
   * Update mission progress for check-in
   */
  updateMissionProgress(
    userId: string,
    locationId: string,
    referenceId?: string,
  ): Promise<void>;
}
