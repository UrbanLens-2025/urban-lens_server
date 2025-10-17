export const ILocationQueryService = Symbol('ILocationQueryService');
export interface ILocationQueryService {
  // public locations
  getNearbyPublicLocationsByCoordinates(): Promise<unknown>;
  getPublicLocationDetailsById(): Promise<unknown>;

  // all locations
  searchAllLocations(): Promise<unknown>;
  getBusinessOwnedLocations(): Promise<unknown>;
  getAnyLocationDetailsById(): Promise<unknown>;
}
