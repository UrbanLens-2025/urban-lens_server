import { LocationMissionMetric } from '../domain/LocationMission.entity';

export const IMissionProgressService = Symbol('IMissionProgressService');

export interface IMissionProgressService {
  updateMissionProgress(
    userId: string,
    locationId: string,
    metric: LocationMissionMetric,
    referenceId?: string,
  ): Promise<void>;
}
