export const ILocationBookingConfigManagementService = Symbol(
  'ILocationBookingConfigManagementService',
);
export interface ILocationBookingConfigManagementService {
  addConfig(): Promise<unknown>;
  updateConfig(): Promise<unknown>;
  getConfig(): Promise<unknown>;
}
