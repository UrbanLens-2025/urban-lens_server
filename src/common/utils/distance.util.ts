/**
 * Calculate distance between two geographic coordinates using Haversine formula
 *
 * @param lat1 - Latitude of first point (in degrees)
 * @param lon1 - Longitude of first point (in degrees)
 * @param lat2 - Latitude of second point (in degrees)
 * @param lon2 - Longitude of second point (in degrees)
 * @returns Distance in kilometers
 *
 * @example
 * // Calculate distance from Ho Chi Minh City to Hanoi
 * const distance = calculateDistance(10.8231, 106.6297, 21.0285, 105.8542);
 * console.log(distance); // ~1166 km
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in kilometers

  // Convert degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in km
}

/**
 * Convert degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between multiple points (array of coordinates)
 *
 * @param points - Array of [latitude, longitude] pairs
 * @returns Total distance in kilometers
 *
 * @example
 * const route = [
 *   [10.762622, 106.660172], // Point 1
 *   [10.775847, 106.704365], // Point 2
 *   [10.782622, 106.680172], // Point 3
 * ];
 * const totalDistance = calculateRouteDistance(route);
 * console.log(totalDistance); // Total km for the route
 */
export function calculateRouteDistance(
  points: Array<[number, number]>,
): number {
  if (points.length < 2) {
    return 0;
  }

  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [lat1, lon1] = points[i];
    const [lat2, lon2] = points[i + 1];
    totalDistance += calculateDistance(lat1, lon1, lat2, lon2);
  }

  return totalDistance;
}

/**
 * Estimate travel time based on distance and average speed
 *
 * @param distanceKm - Distance in kilometers
 * @param averageSpeedKmh - Average speed in km/h (default: 30 km/h for city)
 * @returns Estimated time in minutes
 *
 * @example
 * const time = estimateTravelTime(15, 30); // 15km at 30km/h
 * console.log(time); // 30 minutes
 */
export function estimateTravelTime(
  distanceKm: number,
  averageSpeedKmh: number = 30,
): number {
  return Math.ceil((distanceKm / averageSpeedKmh) * 60);
}

/**
 * Find nearest point from a given location
 *
 * @param fromLat - Starting latitude
 * @param fromLon - Starting longitude
 * @param points - Array of points with lat/lon
 * @returns Index of nearest point and its distance
 *
 * @example
 * const points = [
 *   { lat: 10.762622, lon: 106.660172 },
 *   { lat: 10.775847, lon: 106.704365 },
 * ];
 * const nearest = findNearestPoint(10.770000, 106.670000, points);
 * console.log(nearest); // { index: 0, distance: 1.23 }
 */
export function findNearestPoint<T extends { lat: number; lon: number }>(
  fromLat: number,
  fromLon: number,
  points: T[],
): { index: number; distance: number; point: T } | null {
  if (points.length === 0) {
    return null;
  }

  let minDistance = Infinity;
  let nearestIndex = 0;

  points.forEach((point, index) => {
    const distance = calculateDistance(fromLat, fromLon, point.lat, point.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = index;
    }
  });

  return {
    index: nearestIndex,
    distance: minDistance,
    point: points[nearestIndex],
  };
}

/**
 * Check if a point is within a certain radius from a center point
 *
 * @param centerLat - Center point latitude
 * @param centerLon - Center point longitude
 * @param pointLat - Point to check latitude
 * @param pointLon - Point to check longitude
 * @param radiusKm - Radius in kilometers
 * @returns True if point is within radius
 *
 * @example
 * const isNearby = isWithinRadius(10.762622, 106.660172, 10.775847, 106.704365, 5);
 * console.log(isNearby); // true or false
 */
export function isWithinRadius(
  centerLat: number,
  centerLon: number,
  pointLat: number,
  pointLon: number,
  radiusKm: number,
): boolean {
  const distance = calculateDistance(centerLat, centerLon, pointLat, pointLon);
  return distance <= radiusKm;
}

/**
 * Format distance for display
 *
 * @param distanceKm - Distance in kilometers
 * @returns Formatted string (e.g., "1.2 km" or "850 m")
 *
 * @example
 * formatDistance(1.234); // "1.2 km"
 * formatDistance(0.75);  // "750 m"
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${Math.round(distanceKm * 10) / 10} km`;
}
