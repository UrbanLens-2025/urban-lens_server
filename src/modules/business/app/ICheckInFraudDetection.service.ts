export const ICheckInFraudDetectionService = Symbol(
  'ICheckInFraudDetectionService',
);
export interface ICheckInFraudDetectionService {
  validateCheckIn(): Promise<unknown>;
}
